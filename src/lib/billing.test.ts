import { describe, expect, it } from "vitest";
import { computeTotals, assertValidLines, round2, formatDocNumber, formatDZD } from "./billing";

describe("round2", () => {
  it("arrondi demi-haut standard", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10.004)).toBe(10.0);
    expect(round2(0.1 + 0.2)).toBe(0.3);
  });
});

describe("computeTotals", () => {
  it("facture simple 19%", () => {
    const t = computeTotals(
      [{ description: "Service dev", quantity: 10, unit_price: 5000, vat_rate: 19 }],
      2
    );
    expect(t.subtotal_ht).toBe(50000);
    expect(t.total_tva).toBe(9500);
    expect(t.total_stamp).toBe(1000);
    expect(t.total_ttc).toBe(60500);
  });

  it("taux mixtes 0/9/19", () => {
    const t = computeTotals(
      [
        { description: "Export", quantity: 1, unit_price: 10000, vat_rate: 0 },
        { description: "Alimentaire", quantity: 2, unit_price: 500, vat_rate: 9 },
        { description: "Conseil", quantity: 3, unit_price: 2000, vat_rate: 19 },
      ],
      0
    );
    expect(t.subtotal_ht).toBe(17000); // 10000 + 1000 + 6000
    expect(t.total_tva).toBe(1230); // 0 + 90 + 1140
    expect(t.total_stamp).toBe(0);
    expect(t.total_ttc).toBe(18230);
  });

  it("montants décimaux avec arrondi cohérent", () => {
    const t = computeTotals(
      [{ description: "Matériaux", quantity: 3.333, unit_price: 12.345, vat_rate: 19 }],
      2
    );
    expect(t.subtotal_ht).toBe(41.15); // 3.333 × 12.345 = 41.145885 → 41.15
    expect(t.total_tva).toBe(7.82); // 41.15 × 19% = 7.8185 → 7.82
    expect(t.lines.length).toBe(1);
  });

  it("ligne à zéro tolérée (exonéré), total stable", () => {
    const t = computeTotals(
      [{ description: "Achat import", quantity: 1, unit_price: 0, vat_rate: 0 }],
      2
    );
    expect(t.total_ttc).toBe(0);
  });
});

describe("assertValidLines", () => {
  it("rejette liste vide", () => {
    expect(() => assertValidLines([])).toThrowError(/au moins une ligne/);
  });
  it("rejette qté nulle", () => {
    expect(() =>
      assertValidLines([{ description: "X", quantity: 0, unit_price: 1, vat_rate: 19 }])
    ).toThrowError(/Quantité/);
  });
  it("rejette taux de TVA inconnu", () => {
    expect(() =>
      assertValidLines([{ description: "X", quantity: 1, unit_price: 1, vat_rate: 5 }])
    ).toThrowError(/TVA/);
  });
});

describe("formatDocNumber", () => {
  it("format FAC/DEV 4 digits", () => {
    expect(formatDocNumber("invoice", 2026, 4)).toBe("FAC-2026-0004");
    expect(formatDocNumber("quote", 2026, 111)).toBe("DEV-2026-0111");
  });
});

describe("formatDZD", () => {
  it("format fr-DZ", () => {
    const out = formatDZD(1234567.89);
    expect(out.replace(/\s+/g, " ")).toBe("1 234 567,89 DA");
    expect(formatDZD(0).replace(/\s+/g, " ")).toBe("0,00 DA");
  });
});
