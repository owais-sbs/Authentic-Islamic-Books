import { createClient, SupabaseClient } from '@supabase/supabase-js';

function cleanEnv(value: string | undefined): string | undefined {
  return value?.trim().replace(/^["']|["']$/g, '') || undefined;
}

const url = cleanEnv(import.meta.env.VITE_SUPABASE_URL);
const anonKey = cleanEnv(import.meta.env.VITE_SUPABASE_ANON_KEY);

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey && anonKey.split('.').length === 3);
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then restart the dev server.'
    );
  }
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export function getSupabaseUrl(): string | undefined {
  return url;
}

export function resetSupabaseClient(): void {
  client = null;
}
