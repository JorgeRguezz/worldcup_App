import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function cleanEnvValue(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^["']|["']$/g, '');
  return cleaned || undefined;
}

function normalizeSupabaseUrl(value: string | undefined): string | undefined {
  const cleaned = cleanEnvValue(value);
  if (!cleaned) return cleaned;
  return cleaned.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

const normalizedSupabaseUrl = normalizeSupabaseUrl(supabaseUrl);
const normalizedSupabaseAnonKey = cleanEnvValue(supabaseAnonKey);

function isValidUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

const hasSupabaseConfig = Boolean(
  normalizedSupabaseUrl &&
    normalizedSupabaseAnonKey &&
    isValidUrl(normalizedSupabaseUrl) &&
    !normalizedSupabaseUrl.includes('your-project') &&
    !normalizedSupabaseAnonKey.includes('your-public'),
);

function createSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig) return null;

  try {
    return createClient(normalizedSupabaseUrl!, normalizedSupabaseAnonKey!);
  } catch {
    return null;
  }
}

export const supabase: SupabaseClient | null = createSupabaseClient();
export const isSupabaseConfigured = Boolean(supabase);
