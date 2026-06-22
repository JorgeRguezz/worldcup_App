import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function normalizeSupabaseUrl(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);

export const isSupabaseConfigured = Boolean(
  normalizedSupabaseUrl &&
    supabaseAnonKey &&
    !normalizedSupabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-public'),
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(normalizedSupabaseUrl!, supabaseAnonKey!)
  : null;
