import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté CLIENT (browser).
 * Anon key uniquement — RLS protège l'accès aux données.
 */
export function createClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
