import { supabase } from './supabaseClient';

/**
 * Get current session user along with their profile metadata
 */
export async function getCurrentUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
      return null;
    }

    const authUser = session.user;

    // Fetch extra profile details from profiles table if it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email,
      username: profile?.username || authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'Aspirant',
      target_exam: profile?.target_exam || authUser.user_metadata?.target_exam || 'JEE Main',
      role: profile?.role || 'student',
      created_at: authUser.created_at
    };
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}

/**
 * Sign up a new user with email, password, and metadata
 */
export async function signUpUser(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: metadata.username || email.split('@')[0],
          target_exam: metadata.target_exam || 'JEE Main'
        }
      }
    });

    if (error) throw error;

    // Also attempt inserting into profiles table if setup
    if (data?.user) {
      await supabase.from('profiles').upsert([
        {
          id: data.user.id,
          username: metadata.username || email.split('@')[0],
          target_exam: metadata.target_exam || 'JEE Main'
        }
      ]).catch(() => {});
    }

    return { data, error: null };
  } catch (err) {
    console.error('Sign up error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Sign in existing user with email and password
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    const user = await getCurrentUser();
    return { data: user, error: null };
  } catch (err) {
    console.error('Sign in error:', err);
    return { data: null, error: err.message };
  }
}

/**
 * Sign out current user
 */
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