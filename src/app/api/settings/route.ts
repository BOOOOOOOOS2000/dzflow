import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "Pas d'organisation" }, { status: 404 });

  const form = await req.formData();
  const updates: Record<string, string> = {};
  form.forEach((v, k) => {
    if (typeof v === "string" && v.trim()) updates[k] = v.trim();
  });

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
  }

  const { error } = await supabase
    .from("orgs")
    .update(updates)
    .eq("id", membership.org_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}