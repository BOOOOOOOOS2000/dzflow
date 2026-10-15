import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { stockMovementSchema } from "@/lib/validators";

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

  const parsed = stockMovementSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 });
  }
  const m = parsed.data;

  const { data: product } = await supabase
    .from("products")
    .select("stock_qty")
    .eq("id", m.product_id)
    .single();
  if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  const delta = m.type === "in" ? m.quantity : -m.quantity;
  if (Number(product.stock_qty) + delta < 0) {
    return NextResponse.json({ error: "Stock insuffisant" }, { status: 422 });
  }

  const { error: movErr } = await supabase.from("stock_movements").insert({
    ...m,
    org_id: membership.org_id,
    created_by: user.id,
  });
  if (movErr) return NextResponse.json({ error: movErr.message }, { status: 500 });

  const { error: updErr } = await supabase
    .from("products")
    .update({ stock_qty: Number(product.stock_qty) + delta })
    .eq("id", m.product_id);
  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 201 });
}