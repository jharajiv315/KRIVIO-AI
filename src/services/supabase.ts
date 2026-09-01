import { createClient } from '@supabase/supabase-js';

// Resolve Supabase project URL supporting Vite and Next.js / Cloud standard prefixes
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://mvbpxcsyyasckzymjyjb.supabase.co';

// Resolve Supabase Anon Key supporting Vite and Next.js / Cloud standard prefixes
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YnB4Y3N5eWFzY2t6eW1qeWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMwNjQsImV4cCI6MjEwMzY3OTA2NH0.U3OcsC9bZZ5ORcNg8z_CEMf-kDg3PVqxetiZGEU_i24';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Dynamically resolves the application base URL for OAuth redirects and callbacks.
 * Supports VITE_SITE_URL, NEXT_PUBLIC_SITE_URL, VITE_PUBLIC_SITE_URL, or window.location.origin.
 */
export const getSiteUrl = (): string => {
  const envUrl =
    import.meta.env.VITE_SITE_URL ||
    import.meta.env.NEXT_PUBLIC_SITE_URL ||
    import.meta.env.VITE_PUBLIC_SITE_URL ||
    '';

  if (envUrl && typeof envUrl === 'string' && !envUrl.includes('MY_APP_URL')) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return 'https://krivio-ai.vercel.app';
};

/**
 * Trigger Supabase OAuth sign-in with Google.
 * Redirects the user to Google authentication and returns back to the application.
 *
 * @param redirectTo Optional specific redirect route or absolute URL (defaults to production site root).
 */
export const signInWithGoogleOAuth = async (redirectTo?: string) => {
  const baseUrl = getSiteUrl();

  let destination = `${baseUrl}/`;
  if (redirectTo) {
    if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
      destination = redirectTo;
    } else {
      destination = `${baseUrl}${redirectTo.startsWith('/') ? '' : '/'}${redirectTo}`;
    }
  } else if (typeof window !== 'undefined' && window.location?.origin) {
    destination = `${window.location.origin}/`;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: destination,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign out of Supabase session.
 */
export const signOutSupabase = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase signout error:', error);
  }
};

