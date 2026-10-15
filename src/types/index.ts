export interface Org {
  id: string;
  name: string;
  legal_form: string | null;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  ai: string | null;
  address: string | null;
  phone: string | null;
  vat_rate: number;
  stamp_rate: number;
  plan: "free" | "pro" | "business";
  created_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  wilaya: string | null;
  address: string | null;
  is_prospect: boolean;
  notes: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;
  sku: string | null;
  description: string | null;
  purchase_price: number;
  sale_price: number;
  stock_qty: number;
  min_stock: number;
  active: boolean;
  created_at: string;
}

export interface StockMovement {
  id: string;
  org_id: string;
  product_id: string;
  type: "in" | "out";
  quantity: number;
  reason: "purchase" | "sale" | "adjustment" | "return" | "other";
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  org_id: string;
  number: string;
  kind: "quote" | "invoice";
  client_id: string;
  client_name?: string;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  notes: string | null;
  subtotal: number;
  tax_amount: number;
  stamp_amount: number;
  total: number;
  created_at: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  product_id: string | null;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
  position: number;
}

export type DealStage = "lead" | "contacted" | "proposal" | "won" | "lost";

export interface DashboardStats {
  revenue_12m: { month: string; label: string; value: number }[];
  ca_total: number;
  expenses_total: number;
  profit: number;
  unpaid_count: number;
  unpaid_amount: number;
  low_stock: { product: string; qty: number; min: number }[];
  top_products: { name: string; revenue: number }[];
}
