import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { invoiceSchema } from "@/lib/validators";
import { computeTotals, formatDocNumber } from "@/lib/billing";

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

  const parsed = invoiceSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten() }, { status: 422 });
  }
  const inv = parsed.data;

  // Numérotation continue
  const year = new Date(inv.issue_date).getFullYear();
  const { data: seq } = await supabase
    .from("doc_sequences")
    .select("last_number")
    .eq("org_id", membership.org_id)
    .eq("kind", inv.kind)
    .eq("year", year)
    .single();
  const nextNum = (seq?.last_number || 0) + 1;
  const number = formatDocNumber(inv.kind, year, nextNum);

  // Calcul des totaux
  const lines = inv.lines.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unit_price: l.unit_price,
    vat_rate: l.vat_rate,
  }));
  const totals = computeTotals(lines, 2); // timbre fiscal 2%

  // Insertion facture
  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      org_id: membership.org_id,
      number,
      kind: inv.kind,
      client_id: inv.client_id,
      status: inv.kind === "invoice" ? "draft" : "draft",
      issue_date: inv.issue_date.toISOString().split("T")[0],
      due_date: inv.due_date?.toISOString().split("T")[0] || null,
      notes: inv.notes || null,
      subtotal: totals.subtotal_ht,
      tax_amount: totals.total_tva,
      stamp_amount: totals.total_stamp,
      total: totals.total_ttc,
    })
    .select()
    .single();
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 });

  // Insertion lignes
  const items = inv.lines.map((l, idx) => ({
    invoice_id: invoice.id,
    description: l.description,
    product_id: l.product_id || null,
    quantity: l.quantity,
    unit_price: l.unit_price,
    vat_rate: l.vat_rate,
    line_total: round2(l.quantity * l.unit_price * (1 + l.vat_rate / 100)),
    position: idx,
  }));
  const { error: itemsErr } = await supabase.from("invoice_items").insert(items);
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 });

  // Update sequence
  await supabase
    .from("doc_sequences")
    .upsert({ org_id: membership.org_id, kind: inv.kind, year, last_number: nextNum })
    .eq("org_id", membership.org_id)
    .eq("kind", inv.kind)
    .eq("year", year);

  return NextResponse.json({ ok: true, id: invoice.id, number }, { status: 201 });
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}