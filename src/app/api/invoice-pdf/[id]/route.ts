import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { formatDZD, computeTotals } from "@/lib/billing";
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
    .select("*, invoice_items(*), clients(*), orgs(*)")
    .eq("id", id)
    .single();

  if (!inv) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });

  // Calculer les totaux
  const lines = inv.invoice_items.map((it: any) => ({
    description: it.description,
    quantity: Number(it.quantity),
    unit_price: Number(it.unit_price),
    vat_rate: Number(it.vat_rate),
  }));
  const totals = computeTotals(lines, Number(inv.orgs?.stamp_rate || 2));

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    const buffer = Buffer.concat(chunks);
    // on ne fait rien ici, le buffer est retourné après
  });

  // En-tête entreprise
  doc.fontSize(18).font("Helvetica-Bold").text(inv.orgs?.name || "DZFlow", { align: "left" });
  doc.fontSize(9).font("Helvetica").text([
    `RC: ${inv.orgs?.rc || "—"}`,
    `NIF: ${inv.orgs?.nif || "—"}`,
    `Adresse: ${inv.orgs?.address || "—"}`,
    `Tél: ${inv.orgs?.phone || "—"}`,
  ].filter(Boolean).join("  •  "));
  doc.moveDown(0.5);

  // Titre
  const kindLabel = inv.kind === "invoice" ? "FACTURE" : "DEVIS";
  doc.fontSize(14).font("Helvetica-Bold").text(kindLabel, { align: "right" });
  doc.fontSize(10).font("Helvetica").text(`N° ${inv.number}`, { align: "right" });
  doc.fontSize(10).text(`Date: ${new Date(inv.issue_date).toLocaleDateString("fr-DZ")}`, { align: "right" });
  if (inv.due_date) doc.text(`Échéance: ${new Date(inv.due_date).toLocaleDateString("fr-DZ")}`, { align: "right" });
  doc.moveDown(1);

  // Client
  doc.fontSize(10).font("Helvetica-Bold").text("Facturer à :");
  doc.fontSize(10).font("Helvetica").text([
    inv.clients?.name || "—",
    inv.clients?.address || "",
    `${inv.clients?.wilaya || ""}`.trim(),
    `Tél: ${inv.clients?.phone || "—"}`,
  ].filter(Boolean).join("\n"));
  doc.moveDown(1.5);

  // Tableau
  const colWidths = { desc: 240, qty: 60, pu: 80, vat: 40, total: 100 };
  const tableTop = doc.y;

  // Header
  doc.font("Helvetica-Bold").fontSize(9);
  let x = 40;
  doc.text("Désignation", x, tableTop, { width: colWidths.desc });
  x += colWidths.desc;
  doc.text("Qté", x, tableTop, { width: colWidths.qty, align: "right" });
  x += colWidths.qty;
  doc.text("P.U. HT", x, tableTop, { width: colWidths.pu, align: "right" });
  x += colWidths.pu;
  doc.text("TVA %", x, tableTop, { width: colWidths.vat, align: "center" });
  x += colWidths.vat;
  doc.text("Total HT", x, tableTop, { width: colWidths.total, align: "right" });
  doc.moveTo(40, doc.y + 4).lineTo(550, doc.y + 4).stroke();

  // Lignes
  doc.font("Helvetica").fontSize(9);
  for (const line of inv.invoice_items) {
    const lineHt = Number(line.quantity) * Number(line.unit_price);
    const lineTva = (lineHt * Number(line.vat_rate)) / 100;
    const lineTotal = lineHt + lineTva;
    let y = doc.y + 6;
    x = 40;
    doc.text(line.description, x, y, { width: colWidths.desc });
    x += colWidths.desc;
    doc.text(Number(line.quantity).toLocaleString("fr-DZ"), x, y, { width: colWidths.qty, align: "right" });
    x += colWidths.qty;
    doc.text(formatDZD(Number(line.unit_price)), x, y, { width: colWidths.pu, align: "right" });
    x += colWidths.pu;
    doc.text(`${line.vat_rate}%`, x, y, { width: colWidths.vat, align: "center" });
    x += colWidths.vat;
    doc.text(formatDZD(lineHt), x, y, { width: colWidths.total, align: "right" });
  }
  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Totaux
  doc.font("Helvetica").fontSize(9);
  const rightX = 450;
  doc.text(`Sous-total HT :`, rightX, doc.y, { width: 80, align: "right" });
  doc.text(formatDZD(totals.subtotal_ht), rightX + 80, doc.y, { width: 100, align: "right" });
  doc.moveDown(0.3);
  doc.text(`TVA totale :`, rightX, doc.y, { width: 80, align: "right" });
  doc.text(formatDZD(totals.total_tva), rightX + 80, doc.y, { width: 100, align: "right" });
  doc.moveDown(0.3);
  doc.text(`Timbre fiscal :`, rightX, doc.y, { width: 80, align: "right" });
  doc.text(formatDZD(totals.total_stamp), rightX + 80, doc.y, { width: 100, align: "right" });
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(10);
  doc.text(`TOTAL TTC :`, rightX, doc.y, { width: 80, align: "right" });
  doc.text(formatDZD(totals.total_ttc), rightX + 80, doc.y, { width: 100, align: "right" });

  // Pied
  doc.moveDown(2);
  doc.fontSize(8).font("Helvetica").text(
    "Cette facture est conforme au décret 05-468. TVA non récupérable si non applicable.",
    { align: "center" }
  );

  doc.end();

  // Attendre la fin
  await new Promise<void>((resolve) => doc.on("end", resolve));
  const buffer = Buffer.concat(chunks);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.number}.pdf"`,
    },
  });
}