import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-url') &&
    !supabaseAnonKey.includes('your-anon-key')
);

// Fallback placeholder URL and key for build and unconfigured environments
const effectiveUrl = isSupabaseConfigured && supabaseUrl ? supabaseUrl : 'https://placeholder-project.supabase.co';
const effectiveKey = isSupabaseConfigured && supabaseAnonKey ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient<any>(effectiveUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});
