-- ============================================================
-- DZFlow — Migration 0001 : schéma initial + RLS multi-tenant
-- Exécuter dans Supabase SQL Editor (ou `supabase db push`)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Types ----------
create type invoice_status as enum ('draft','sent','paid','overdue','cancelled');
create type deal_stage as enum ('lead','contacted','proposal','won','lost');
create type stock_reason as enum ('purchase','sale','adjustment','return','other');

-- ---------- Organisations (un tenant = une entreprise) ----------
create table orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_form text,
  nif text, nis text, rc text, ai text,
  address text, phone text,
  vat_rate numeric(4,2) not null default 19,
  stamp_rate numeric(4,2) not null default 2,
  plan text not null default 'free' check (plan in ('free','pro','business')),
  created_at timestamptz not null default now()
);

-- ---------- Membres d'organisation (lien auth.users <-> org) ----------
create table org_members (
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index idx_org_members_user on org_members(user_id);

-- ---------- Clients ----------
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
create index idx_clients_name on clients(org_id, name);

-- ---------- Produits / stocks ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  name text not null,
  sku text,
  description text,
  purchase_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  stock_qty numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_products_org on products(org_id);

-- ---------- Mouvements de stock ----------
create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  type text not null check (type in ('in','out')),
  quantity numeric(12,2) not null check (quantity > 0),
  reason stock_reason not null default 'other',
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index idx_movements_product on stock_movements(product_id, created_at desc);
create index idx_movements_org on stock_movements(org_id, created_at desc);

-- ---------- Devis & Factures ----------
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
create index idx_invoices_status on invoices(org_id, status);
create index idx_invoices_client on invoices(client_id);

create table invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  description text not null,
  product_id uuid references products(id) on delete set null,
  quantity numeric(12,2) not null check (quantity > 0),
  unit_price numeric(12,2) not null,
  vat_rate numeric(4,2) not null default 19,
  line_total numeric(14,2) not null,
  position int not null default 0
);
create index idx_items_invoice on invoice_items(invoice_id, position);

-- ---------- Numérotation continue (décret 05-468) ----------
create table doc_sequences (
  org_id uuid not null references orgs(id) on delete cascade,
  kind text not null check (kind in ('invoice','quote')),
  year int not null,
  last_number int not null default 0,
  primary key (org_id, kind, year)
);

-- ---------- Pipeline commercial ----------
create table deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references orgs(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  title text not null,
  value numeric(14,2) not null default 0,
  stage deal_stage not null default 'lead',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_deals_org on deals(org_id, stage);

-- ---------- Paramètres ----------
create table settings (
  org_id uuid primary key references orgs(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  updated_at timestamptz not null default now()
);

-- ---------- Audit (v1.1) ----------
create table audit_logs (
  id bigserial primary key,
  org_id uuid not null references orgs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_org on audit_logs(org_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY — isolation multi-tenant
-- Règle d'or : AUCUNE table sans org_id n'est exposée.
-- Chaque policy vérifie la membership via org_members + auth.uid().
-- ============================================================
alter table orgs enable row level security;
alter table clients enable row level security;
alter table products enable row level security;
alter table stock_movements enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table deals enable row level security;
alter table settings enable row level security;
alter table doc_sequences enable row level security;
alter table audit_logs enable row level security;
-- org_members : géré par le trigger (insert au signup) — pas de RLS public

create or replace function current_org_ids() returns setof uuid
language sql stable security definer as $$
  select org_id from org_members where user_id = auth.uid()
$$;

-- orgs : visible si membre
create policy "orgs_member_select" on orgs for select
  using (id in (select current_org_ids()));
create policy "orgs_member_update" on orgs for update
  using (id in (select current_org_ids()));
create policy "orgs_member_insert" on orgs for insert
  with check (true); -- création au signup (avant membership) ; le trigger lie l'org

-- Pattern générique (répété par table) :
create policy "clients_member_all" on clients for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "products_member_all" on products for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "movements_member_all" on stock_movements for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "invoices_member_all" on invoices for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "items_member_select" on invoice_items for select
  using (invoice_id in (
    select id from invoices where org_id in (select current_org_ids())
  ));
create policy "items_member_insert" on invoice_items for insert
  with check (invoice_id in (
    select id from invoices where org_id in (select current_org_ids())
  ));
create policy "items_member_update" on invoice_items for update
  using (invoice_id in (
    select id from invoices where org_id in (select current_org_ids())
  ));
create policy "items_member_delete" on invoice_items for delete
  using (invoice_id in (
    select id from invoices where org_id in (select current_org_ids())
  ));

create policy "deals_member_all" on deals for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "settings_member_all" on settings for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "sequences_member_all" on doc_sequences for all
  using (org_id in (select current_org_ids()))
  with check (org_id in (select current_org_ids()));

create policy "audit_member_select" on audit_logs for select
  using (org_id in (select current_org_ids()));
create policy "audit_member_insert" on audit_logs for insert
  with check (org_id in (select current_org_ids()));

-- ============================================================
-- Trigger : créer l'organisation + membership au signup
-- (appelé par l'app API ou par un RPC)
-- ============================================================
create or replace function create_org_for_user(
  p_name text, p_legal_form text, p_nif text, p_rc text,
  p_address text, p_phone text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  new_org_id uuid;
begin
  insert into orgs (name, legal_form, nif, rc, address, phone)
  values (p_name, p_legal_form, p_nif, p_rc, p_address, p_phone)
  returning id into new_org_id;

  insert into org_members (org_id, user_id, role)
  values (new_org_id, auth.uid(), 'owner')
  on conflict (org_id, user_id) do nothing;

  insert into settings (org_id) values (new_org_id) on conflict do nothing;

  return new_org_id;
end;
$$;
revoke execute on function create_org_for_user(uuid) from public;
