import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { data: inv } = await supabase
    .from("invoices")
    .select("*, invoice_items(*), clients(*)")
    .eq("id", id)
    .single();

  if (!inv) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  return NextResponse.json(inv);
}