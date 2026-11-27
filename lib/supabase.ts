import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Is Supabase configured? If not, the site runs without sign-in, using browser storage only. */
export const cloudEnabled = Boolean(url && anonKey);

/** Google sign-in is shown only when the Google provider is enabled in Supabase */
export const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_LOGIN === "1";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!cloudEnabled || typeof window === "undefined") return null;
  if (!client) {
    client = createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  }
  return client;
}
