import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Supabase sozlanganmi? Sozlanmagan bo'lsa sayt login'siz, faqat brauzer xotirasi bilan ishlaydi. */
export const cloudEnabled = Boolean(url && anonKey);

/** Google orqali kirish faqat Supabase'da Google provayderi yoqilganda ko'rsatiladi */
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
