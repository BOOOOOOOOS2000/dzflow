# Phase 3 — Architecture Technique DZFlow

## 3.1 Vue d'ensemble

```
[Vercel Free: Next.js 14 (App Router, TS)]
   ├── Pages RSC (Server Components) → queries directes Supabase (service role côté serveur)
   ├── Client components (Tailwind + shadcn/ui + Recharts + Zustand)
   └── /api/* (Route Handlers) : PDF generation, webhooks
                     │
[Supabase Free: Postgres + Auth + RLS + Realtime]
   └── DB : orgs, users, clients, products, stock_movements,
            invoices, invoice_items, deals, settings, plans
```

**Principe :** pas de backend séparé (pas de coût, pas d'ops). Next.js Route Handlers = couche API mince. Supabase Auth = identité. RLS = sécurité multi-tenant (chaque ligne porte `org_id`).

## 3.2 Structure du projet

```
dzflow/
├── src/
│   ├── app/
│   │   ├── (auth)/login, register        # pages publiques
│   │   ├── (app)/
│   │   │   ├── layout.tsx                # sidebar + topbar + theme
│   │   │   ├── dashboard/
│   │   │   ├── clients/[id]/
│   │   │   ├── invoices/, invoices/new, invoices/[id]
│   │   │   ├── products/, products/new
│   │   │   ├── stock/
│   │   │   ├── pipeline/
│   │   │   └── settings/
│   │   └── api/
│   │       └── invoice-pdf/[id]/route.ts # génération PDF (pdfkit)
│   ├── components/
│   │   ├── ui/          # shadcn/ui (button, card, dialog, table, ...)
│   │   ├── layout/      # sidebar, topbar, mobile-nav
│   │   ├── invoices/    # invoice-form, invoice-table, pdf-preview
│   │   ├── crm/         # client-card, pipeline-board, deal-card
│   │   ├── stock/       # product-table, movement-form
│   │   └── dashboard/   # kpi-card, revenue-chart, alerts-panel
│   ├── lib/
│   │   ├── supabase/    # client.ts (anon), server.ts (RSC), admin.ts
│   │   ├── auth/        # session helpers
│   │   ├── billing/     # moteur de calcul : TVA, timbre, totaux (PURE, testé)
│   │   ├── numbering.ts # FAC-2026-0001
│   │   ├── format.ts    # DZD, dates, montants en lettres (fr)
│   │   └── validators/  # schémas Zod (client, invoice, product)
│   ├── hooks/           # use-invoices, use-dashboard, use-theme
│   ├── store/           # zustand : theme, ui, invoice-draft
│   └── types/
├── supabase/migrations/0001_init.sql
├── tailwind.config.ts   # tokens couleurs, dark mode class
├── package.json
└── next.config.ts
```

## 3.3 Base de données (PostgreSQL + RLS)

```sql
-- 0001_init.sql
create extension if not exists "pgcrypto";

create type invoice_status as enum ('draft','sent','paid','overdue','cancelled');
create type deal_stage     as enum ('lead','contacted','proposal','won','lost');
create type stock_reason   as enum ('purchase','sale','adjustment','return','other');

create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_form text,            -- SARL, EURL, SPA...
  nif text, nis text, rc text, ai text,
  address text, phone text,
  vat_rate numeric(4,2) default 19,
  stamp_rate numeric(4,2) default 2,      -- timbre fiscal
  plan text not null default 'free' check (plan in ('free','pro','business')),
  created_at timestamptz not null default now()
);

create table org_members (
  org_id uuid references orgs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','member')),
  primary key (org_id, user_id)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  phone text, email text, wilaya text, address text,
  is_prospect boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create index idx_clients_org on clients(org_id);

create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  sku text,
  description text,
  purchase_price numeric(12,2) default 0,
  sale_price numeric(12,2) default 0,
  stock_qty numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_products_org on products(org_id);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  type text not null check (type in ('in','out')),
  quantity numeric(12,2) not null check (quantity > 0),
  reason stock_reason not null,
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index idx_movements_product on stock_movements(product_id, created_at desc);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  number text not null,
  kind text not null default 'invoice' check (kind in ('quote','invoice')),
  client_id uuid not null references clients(id) on delete restrict,
  status invoice_status not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  notes text,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  stamp_amount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (org_id, number)
);
create index idx_invoices_org on invoices(org_id, created_at desc);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  product_id uuid references products(id) on delete set null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  vat_rate numeric(4,2) not null,
  line_total numeric(14,2) not null,
  position int not null default 0
);

-- Séquences de numérotation (continue, sans saut — décret 05-468)
create table doc_sequences (
  org_id uuid references orgs(id) on delete cascade,
  kind text not null check (kind in ('invoice','quote')),
  year int not null,
  last_number int not null default 0,
  primary key (org_id, kind, year)
);

create table settings (
  org_id uuid primary key references orgs(id) on delete cascade,
  theme text default 'system' check (theme in ('light','dark','system')),
  updated_at timestamptz default now()
);

-- ===== ROW LEVEL SECURITY (sécurité multi-tenant) =====
alter table orgs enable row level security;
-- (mêmes policies sur TOUTES les tables : where org_id in (select org_id from org_members where user_id = auth.uid()))
```

**RLS** : chaque table porte `org_id` ; policy : `using (org_id in (select org_id from org_members where user_id = auth.uid()))`. Aucune requête applicative ne peut lire une autre org. Tests RLS inclus.

## 3.4 Moteur de calcul (lib/billing.ts — pur, 100% testé)

```ts
// Rounding DZD : 2 décimales, arrondi bancaire
export function computeInvoice(lines: Line[], stampRate: number): Totals {
  // subtotal = Σ (qty × unit_price)
  // par ligne : tax = line × vat_rate / (100 + vat_rate) si TTC, /100 si HT
  // total = subtotal + Σ tax + stamp(tax base configurable LF)
}
```
Règles : TVA 0/9/19% par ligne ; timbre fiscal 2% (barème LF2026, configurable par org) ; totaux arrondis 2 décimales ; tests unitaires : 20 cas (taux mixtes, zéros, grands montants).

## 3.5 Sécurité (checklist expert cybersécurité)

1. **RLS sur 100% des tables** + tests d'adversaire (user org A ne lit pas org B)
2. **Supabase Auth** : mdp argon2, email confirm, rate-limit natif
3. **Zod** : validation côté client ET serveur (Route Handlers) de tout input
4. **CSP** stricte dans next.config ; `X-Frame-Options: DENY`
5. **Secrets** : `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur (RSC/API)
6. **PDF** : génération côté serveur (pdfkit), pas de balise iframe externe
7. **Audit** : table `audit_logs` (création facture/suppression client) en v1.1
8. **Backups** : snapshot Supabase quotidien (gratuit sur free tier)

## 3.6 Performance

- RSC : les listes (factures, clients) sont fetchées côté serveur, paginées 50
- Recharts : data agrégée par SQL (pas par JS) — 1 requête par chart
- PWA : manifest + icônes, `next/image` pour les assets
- Budget : < 170 Ko JS initial (code-splitting par route, dynamic import Recharts)
- Caching : `revalidateTag` sur les mutations (dashboard frais en 1 re-render)

## 3.7 Scalabilité (capacité free tier → migration)

| Ressource | Free tier | Limit | Migration payante |
|---|---|---|---|
| Supabase DB | 500 Mo | ~500 orgs | Pro 25$/mois (10$) |
| Supabase Auth | 50K MAU | OK 1 an | inclus Pro |
| Vercel | 100 Go-mois | ~50K visiteurs | Pro 20$/mois |
| Stockage fichiers | 1 Go (logos, PDF) | OK | 10$ |

**Capacité gratuite : ~1 000-2 000 utilisateurs actifs.** La bascule payante (20-35$/mois) arrive vers 150-250 payants — à ce stade, le revenu couvre 10x l'infra.

## 3.8 API interne (Route Handlers)

| Route | Méthode | Rôle |
|---|---|---|
| /api/invoice-pdf/[id] | GET | PDF facture/devis (pdfkit) |
| /api/webhooks/... | POST | (v1.1) paiement Chargily |
| (le reste) | — | Supabase direct depuis les RSC (plus simple, plus rapide) |
