import { supabase } from './supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

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

    const resolvedProfile = profile;

    if (!resolvedProfile) {
      return {
        id: authUser.id,
        email: authUser.email,
        username: '',
        target_exam: '',
        role: 'student',
        is_admin: false,
        created_at: authUser.created_at,
        needsOnboarding: true,
      };
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
 * Complete the profile for a newly authenticated OAuth user.
 * This is intentionally separate from getCurrentUser so a first-time
 * Google user is not silently assigned a placeholder profile before
 * choosing their nickname and exam.
 */
export async function completeOnboarding({ username, target_exam }) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const authUser = session?.user;
    if (!authUser) throw new Error('Your session has expired. Please sign in again.');

    const cleanUsername = String(username || '').trim();
    const cleanExam = String(target_exam || '').trim();

    if (!cleanUsername) throw new Error('Please choose a nickname.');
    if (cleanUsername.length < 3 || cleanUsername.length > 24) {
      throw new Error('Nickname must be between 3 and 24 characters.');
    }
    if (!/^[A-Za-z0-9_]+$/.test(cleanUsername)) {
      throw new Error('Nickname can contain only letters, numbers, and underscores.');
    }
    if (!['JEE Main', 'JEE Advanced', 'NEET'].includes(cleanExam)) {
      throw new Error('Please choose a valid exam.');
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .neq('id', authUser.id)
      .maybeSingle();

    if (existing) throw new Error('That nickname is already taken. Please choose another.');

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert([{
        id: authUser.id,
        username: cleanUsername,
        email: authUser.email || '',
        target_exam: cleanExam,
      }], { onConflict: 'id' })
      .select('*')
      .single();

    if (error) throw error;

    return {
      data: {
        id: authUser.id,
        email: authUser.email,
        username: profile.username,
        target_exam: profile.target_exam,
        role: profile.role || 'student',
        is_admin: profile.is_admin === true,
        created_at: authUser.created_at,
      },
      error: null,
    };
  } catch (err) {
    console.error('Onboarding error:', err);
    return { data: null, error: err.message };
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
        email: String(email).trim(),
        target_exam: metadata.target_exam || 'JEE Main'
      }]).catch((profileError) => {
        console.warn('Profile creation after signup failed:', profileError);
      });
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
    // Capacitor's runtime platform is the source of truth inside the APK.
    // Keep a window.Capacitor fallback for builds where the bridge is exposed
    // globally before the module runtime initializes.
    const capacitorPlatform = Capacitor.getPlatform?.();
    const globalPlatform = typeof window !== 'undefined' ? window.Capacitor?.getPlatform?.() : null;
    const isNative = capacitorPlatform === 'android' || globalPlatform === 'android';
    const redirectTo = isNative ? 'co.prepxai.app://auth/callback' : 'https://www.prepxai.co.in';

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        ...(isNative ? { skipBrowserRedirect: true } : {})
      }
    });
    if (error) throw error;

    if (isNative && data?.url) {
      await Browser.open({ url: data.url, presentationStyle: 'popover' });
    }

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
