import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Champs requis" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Mot de passe trop court (min 8)" }, { status: 400 });
    }

    // Créer l'utilisateur
    const supabase = createAdminSupabase();
    const { data: auth, error: authErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // pas de confirmation email pour MVP
      user_metadata: { name },
    });
    if (authErr || !auth.user) {
      return NextResponse.json({ error: authErr?.message || "Création impossible" }, { status: 400 });
    }
    const userId = auth.user.id;

    // Créer l'organisation directement
    const { data: org, error: orgErr } = await supabase
      .from("orgs")
      .insert({ name })
      .select()
      .single();
    if (orgErr || !org) {
      return NextResponse.json({ error: "Création organisation impossible" }, { status: 400 });
    }
    const orgId = org.id;

    // Créer le membership
    const { error: memberErr } = await supabase
      .from("org_members")
      .insert({ org_id: orgId, user_id: userId, role: "owner" });
    if (memberErr) {
      return NextResponse.json({ error: "Création membership impossible" }, { status: 400 });
    }

    // Créer les settings
    const { error: settingsErr } = await supabase
      .from("settings")
      .insert({ org_id: orgId });
    if (settingsErr) {
      return NextResponse.json({ error: "Création settings impossible" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, orgId, userId });
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}