import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mvbpxcsyyasckzymjyjb.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YnB4Y3N5eWFzY2t6eW1qeWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMDMwNjQsImV4cCI6MjEwMzY3OTA2NH0.U3OcsC9bZZ5ORcNg8z_CEMf-kDg3PVqxetiZGEU_i24';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Trigger Supabase OAuth sign-in with Google.
 * Redirects the user to Google authentication and returns back to the application.
 */
export const signInWithGoogleOAuth = async (redirectTo?: string) => {
  const destination = redirectTo || window.location.origin;
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
