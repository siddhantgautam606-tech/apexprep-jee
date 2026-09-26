import { supabase } from './supabaseClient';

/**
 * Get the current authenticated user from Supabase Auth.
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) return null;

    const authUser = session.user;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching current user profile:', profileError);
      // Keep the valid Auth session even if the profile query has a transient
      // network, RLS, or database failure.
    }

    let resolvedProfile = profile;
    if (!resolvedProfile) {
      const email = authUser.email || '';
      const baseUsername = (authUser.user_metadata?.username
        || email.split('@')[0]
        || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 24) || 'student';

      const profilePayload = {
        id: authUser.id,
        username: baseUsername,
        target_exam: authUser.user_metadata?.target_exam || 'JEE Main'
      };

      const firstAttempt = await supabase
        .from('profiles')
        .upsert([profilePayload], { onConflict: 'id' })
        .select('*')
        .maybeSingle();

      if (!firstAttempt.error) {
        resolvedProfile = firstAttempt.data;
      } else {
        const fallbackAttempt = await supabase
          .from('profiles')
          .upsert([{
            ...profilePayload,
            username: `student_${authUser.id.slice(0, 8)}`
          }], { onConflict: 'id' })
          .select('*')
          .maybeSingle();

        if (!fallbackAttempt.error) resolvedProfile = fallbackAttempt.data;
      }
    }

    return {
      id: authUser.id,
      email: authUser.email,
      username: resolvedProfile?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Aspirant',
      target_exam: resolvedProfile?.target_exam || authUser.user_metadata?.target_exam || 'JEE Main',
      role: resolvedProfile?.role || 'student',
      is_admin: resolvedProfile?.is_admin === true,
      created_at: authUser.created_at
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    // Never revoke a valid session because a profile/session read failed.
    return null;
  }
}

/**
 * Sign up a new user with email, password, and metadata.
 */
export async function signUpUser(emailArg, passwordArg, metadataArg = {}) {
  const email = typeof emailArg === 'object' && emailArg !== null ? emailArg.email : emailArg;
  const password = typeof emailArg === 'object' && emailArg !== null ? emailArg.password : passwordArg;
  const metadata = typeof emailArg === 'object' && emailArg !== null ? (emailArg.metadata || emailArg) : metadataArg;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim(),
      password: String(password),
      options: {
        data: {
          username: metadata.username || String(email).split('@')[0],
          target_exam: metadata.target_exam || 'JEE Main'
        }
      }
    });
    if (error) throw error;

    if (data?.user) {
      await supabase.from('profiles').upsert([{
        id: data.user.id,
        username: metadata.username || String(email).split('@')[0],
        target_exam: metadata.target_exam || 'JEE Main'
      }]).catch(() => {});
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Sign in existing user with email and password.
 */
/** Sign in with Google OAuth. */
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Google sign in error:', err);
    return { error: err.message };
  }
}

export async function signInUser(emailArg, passwordArg) {
  const email = typeof emailArg === 'object' && emailArg !== null ? emailArg.email : emailArg;
  const password = typeof emailArg === 'object' && emailArg !== null ? emailArg.password : passwordArg;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim(),
      password: String(password)
    });
    if (error) throw error;

    // signInWithPassword already created the Auth session. Profile loading
    // is secondary and must not turn a successful login into a logout.
    const user = await getCurrentUser();
    return { data: user || data?.user || null, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Send a password-reset OTP to the registered email.
 *
 * Supabase's Recovery email template must render {{ .Token }}
 * for the user to receive the 6-digit code instead of a link.
 */
export async function sendPasswordResetEmail(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim(), {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Password reset error:', err);
    return { error: err.message };
  }
}

/**
 * Verify the 6-digit password recovery OTP.
 * A successful recovery verification creates the recovery session
 * that is required before updateUser({ password }) can be called.
 */
export async function verifyPasswordResetOtp(email, token) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: String(email).trim(),
      token: String(token).trim(),
      type: 'recovery',
    });

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Password reset OTP verification error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Update the password after recovery OTP verification.
 */
export async function updatePassword(password) {
  try {
    const { error } = await supabase.auth.updateUser({ password: String(password) });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Password update error:', err);
    return { error: err.message };
  }
}

export async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    console.error('Sign out error:', err);
    return { error: err.message };
  }
}

// Aliases for compatibility
export const getUser = getCurrentUser;
export const logout = signOutUser;
export const login = signInUser;
export const register = signUpUser;
