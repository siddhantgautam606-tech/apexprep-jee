import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}');
const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}');
const publishableKey = publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY')!;
const secretKey = secretKeys.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

const publicClient = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function normalizeCode(value: unknown) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

async function createPairing(token: string | null) {
  if (!token) return json({ error: 'You must be logged in on the website first.' }, 401);

  const { data: userData, error: userError } = await publicClient.auth.getUser(token);
  if (userError || !userData.user) return json({ error: 'Your website session has expired. Please log in again.' }, 401);

  const userId = userData.user.id;
  const email = userData.user.email;
  if (!email) return json({ error: 'This account does not have a usable email address.' }, 400);

  await admin
    .from('app_login_pairings')
    .delete()
    .eq('user_id', userId)
    .or('consumed_at.not.is.null,expires_at.lt.now()');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const code = makeCode();
    const codeHash = await sha256(code);
    const { error } = await admin.from('app_login_pairings').insert({
      user_id: userId,
      code_hash: codeHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (!error) {
      return json({ code, expiresInSeconds: 600 });
    }

    if (error.code !== '23505') {
      console.error('Pairing insert failed:', error);
      return json({ error: 'Could not create an app login code.' }, 500);
    }
  }

  return json({ error: 'Could not create a unique app login code. Please try again.' }, 500);
}

async function redeemPairing(codeValue: unknown) {
  const code = normalizeCode(codeValue);
  if (code.length !== 8) return json({ error: 'Enter the 8-character code shown on the website.' }, 400);

  const codeHash = await sha256(code);
  const now = new Date().toISOString();

  const { data: pairing, error: consumeError } = await admin
    .from('app_login_pairings')
    .update({ consumed_at: now })
    .eq('code_hash', codeHash)
    .is('consumed_at', null)
    .gt('expires_at', now)
    .select('user_id')
    .maybeSingle();

  if (consumeError) {
    console.error('Pairing redeem failed:', consumeError);
    return json({ error: 'Could not verify the login code.' }, 500);
  }

  if (!pairing?.user_id) {
    return json({ error: 'That code is invalid, expired, or already used.' }, 400);
  }

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(pairing.user_id);
  const email = userData?.user?.email;
  if (userError || !email) {
    console.error('Pairing user lookup failed:', userError);
    return json({ error: 'The linked account could not be found.' }, 400);
  }

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error('Magic-link generation failed:', linkError);
    return json({ error: 'Could not complete the app login. Please generate a new code.' }, 500);
  }

  return json({
    token_hash: tokenHash,
    type: linkData.properties.verification_type || 'magiclink',
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  try {
    const body = await req.json();
    const action = body?.action;

    if (action === 'create') {
      const authHeader = req.headers.get('Authorization') || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
      return await createPairing(token);
    }

    if (action === 'redeem') {
      return await redeemPairing(body?.code);
    }

    return json({ error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error('App login pairing error:', error);
    return json({ error: 'Unexpected pairing error.' }, 500);
  }
});
