/**
 * Moteur de calcul fiscal — cœur métier DZFlow.
 * Fichier PUR (aucune dépendance DOM/Supabase) → 100% testable.
 *
 * Règles algériennes (LF 2026, configurable par org) :
 *  - TVA : 0 / 9 / 19 % (taux par ligne)
 *  - Timbre fiscal : taux appliqué sur le HT (barème LF, défaut 2 %)
 *  - Montants arrondis 2 décimales (arrondi demi-haut, convention DZD)
 */

export type VatRate = 0 | 9 | 19;

export interface InvoiceLineInput {
  description: string;
  quantity: number;
  unit_price: number; // prix UNitaire HT
  vat_rate: number; // 0 | 9 | 19
}

export interface ComputedLine extends InvoiceLineInput {
  line_ht: number;   // qté × PU
  line_tva: number;  // TVA collectée
  line_ttc: number;  // HT + TVA
}

export interface ComputedTotals {
  subtotal_ht: number;
  total_tva: number;
  total_stamp: number;
  total_ttc: number;
  lines: ComputedLine[];
}

/** Arrondi 2 décimales, demi-haut (10.005 → 10.01). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Calcule les totaux d'une facture.
 * @param lines lignes (prix unitaires HT)
 * @param stampRate taux timbre fiscal en % sur le HT (ex: 2)
 */
export function computeTotals(lines: InvoiceLineInput[], stampRate: number): ComputedTotals {
  const computed: ComputedLine[] = lines.map((l) => {
    const line_ht = round2(l.quantity * l.unit_price);
    const line_tva = round2(line_ht * (l.vat_rate / 100));
    return { ...l, line_ht, line_tva, line_ttc: round2(line_ht + line_tva) };
  });

  const subtotal_ht = round2(computed.reduce((s, l) => s + l.line_ht, 0));
  const total_tva = round2(computed.reduce((s, l) => s + l.line_tva, 0));
  const total_stamp = round2(subtotal_ht * (stampRate / 100));
  const total_ttc = round2(subtotal_ht + total_tva + total_stamp);

  return { subtotal_ht, total_tva, total_stamp, total_ttc, lines: computed };
}

/** Validation stricte avant calcul. Lève une Error lisible (français) si invalide. */
export function assertValidLines(lines: InvoiceLineInput[]): void {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("La facture doit contenir au moins une ligne.");
  }
  for (const l of lines) {
    if (!l.description || !l.description.trim()) {
      throw new Error("Chaque ligne doit avoir une description.");
    }
    if (!(l.quantity > 0)) {
      throw new Error(`Quantité invalide pour « ${l.description} » (doit être > 0).`);
    }
    if (l.unit_price < 0) {
      throw new Error(`Prix unitaire invalide pour « ${l.description} » (doit être ≥ 0).`);
    }
    if (![0, 9, 19].includes(l.vat_rate)) {
      throw new Error(`Taux de TVA invalide pour « ${l.description} » (0, 9 ou 19 %).`);
    }
  }
}

/** Génère le numéro de document : FAC-2026-0004 / DEV-2026-0011 (continuité 05-468). */
export function formatDocNumber(kind: "invoice" | "quote", year: number, seq: number): string {
  const prefix = kind === "invoice" ? "FAC" : "DEV";
  return `${prefix}-${year}-${String(seq).padStart(4, "0")}`;
}

/** Formatage DZD : 1 234 567,89 DA (espaces fines comme séparateurs de milliers). */
export function formatDZD(n: number): string {
  return (
    n.toLocaleString("fr-DZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DA"
  );
}
