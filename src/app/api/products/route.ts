import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validators";

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

  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 });
  }
  const p = parsed.data;

  const { data: product, error } = await supabase
    .from("products")
    .insert({ ...p, org_id: membership.org_id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Stock initial > 0 → mouvement d'entrée
  if (p.stock_qty > 0) {
    await supabase.from("stock_movements").insert({
      org_id: membership.org_id,
      product_id: product.id,
      type: "in",
      quantity: p.stock_qty,
      reason: "adjustment",
      note: "Stock initial",
      created_by: user.id,
    });
  }
  return NextResponse.json({ ok: true, id: product.id }, { status: 201 });
}