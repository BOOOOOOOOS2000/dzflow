import "server-only";
import { createServerSupabase } from "./server";

/**
 * Client admin (service role) — UNIQUEMENT dans les contextes serveur où la
 * sécurité RLS doit être contournée (ex: webhooks, calculs cross-org d'admin).
 * Ne JAMAIS importé dans un Client Component.
 */
export function createAdminSupabase() {
  return createAdminClient();
}

import { createClient as createRawClient } from "@supabase/supabase-js";

function createAdminClient() {
  return createRawClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
