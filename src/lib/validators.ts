import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^(\+213|0)?[5-7]\d{8}$/, "Numéro algérien invalide (ex: 0550 12 34 56)")
    .optional()
    .or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  wilaya: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  is_prospect: z.boolean().default(false),
  notes: z.string().max(2000).optional().or(z.literal("")),
});
export type ClientInput = z.infer<typeof clientSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court").max(150),
  sku: z.string().max(50).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  purchase_price: z.coerce.number().min(0).max(99999999),
  sale_price: z.coerce.number().min(0).max(99999999),
  stock_qty: z.coerce.number().min(0).max(99999999).default(0),
  min_stock: z.coerce.number().min(0).max(99999999).default(0),
});
export type ProductInput = z.infer<typeof productSchema>;

export const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(["in", "out"]),
  quantity: z.coerce.number().positive("Quantité doit être > 0"),
  reason: z.enum(["purchase", "sale", "adjustment", "return", "other"]),
  note: z.string().max(300).optional().or(z.literal("")),
});
export type StockMovementInput = z.infer<typeof stockMovementSchema>;

export const orgProfileSchema = z.object({
  name: z.string().trim().min(2, "Nom de l'entreprise requis").max(120),
  legal_form: z.string().max(60).optional().or(z.literal("")),
  nif: z.string().trim().max(30).optional().or(z.literal("")),
  nis: z.string().trim().max(30).optional().or(z.literal("")),
  rc: z.string().trim().max(40).optional().or(z.literal("")),
  ai: z.string().trim().max(30).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});
export type OrgProfileInput = z.infer<typeof orgProfileSchema>;

export const invoiceLineSchema = z.object({
  description: z.string().trim().min(1, "Description requise").max(300),
  quantity: z.coerce.number().positive("Qté > 0").max(999999),
  unit_price: z.coerce.number().min(0).max(99999999),
  vat_rate: z.union([z.literal(0), z.literal(9), z.literal(19)]),
  product_id: z.string().uuid().optional(),
});
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;

export const invoiceSchema = z.object({
  kind: z.enum(["quote", "invoice"]).default("invoice"),
  client_id: z.string().uuid("Sélectionnez un client"),
  issue_date: z.coerce.date(),
  due_date: z.coerce.date().optional(),
  notes: z.string().max(1000).optional().or(z.literal("")),
  lines: z.array(invoiceLineSchema).min(1, "Ajoutez au moins une ligne"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;
