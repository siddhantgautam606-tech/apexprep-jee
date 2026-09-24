import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://kjsvfpezthhdeaeozacb.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_OlIk9ElGkC4ou8oAEdwXiQ_JISMOx4E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);