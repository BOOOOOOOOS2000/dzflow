# DZFlow — Gestion d'entreprise simple pour PME algériennes

**Statut :** MVP v1.0 — Build réussi, tests 10/10.

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Remplir :
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
# NEXT_PUBLIC_APP_NAME=DZFlow

# 3. Appliquer la migration Supabase
# Dans Supabase SQL Editor → New Query → coller supabase/0001_init.sql → Run

# 4. Lancer en local
npm run dev
# → http://localhost:3000
```

## Tests

```bash
npx vitest run
# 10 tests passés (moteur de calcul fiscal)
```

## Build de production

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

## Déploiement gratuit (Vercel + Supabase)

Voir `docs/phase6-deploiement.md` pour le guide complet.

1. Push sur GitHub
2. Vercel → Import → Ajouter les 4 variables d'env
3. Déployer

## Architecture

- **Frontend :** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui
- **Backend :** Supabase (Postgres + Auth + RLS) — 100% serverless
- **Calculs métier :** `src/lib/billing.ts` (TVA 0/9/19%, timbre fiscal, arrondis DZD)
- **Sécurité :** RLS multi-tenant (chaque ligne porte `org_id`), jamais de service_role côté client
- **PDF :** `pdfkit` dans une Route Handler (`/api/invoice-pdf/[id]`)

## Modules MVP

| Module | Statut | Route(s) |
|---|---|---|
| Auth (login/register) | ✅ | `/login`, `/register`, `/api/login`, `/api/register` |
| Dashboard (KPI + alertes) | ✅ | `/dashboard` |
| CRM (liste clients) | ✅ | `/clients`, `/api/clients` |
| Facturation (liste + PDF) | ✅ | `/invoices`, `/api/invoices`, `/api/invoice-pdf/[id]` |
| Produits / Stocks (liste + mouvements) | ✅ | `/products`, `/stock`, `/api/products`, `/api/stock` |
| Pipeline commercial | ✅ | `/pipeline` |
| Paramètres (profil entreprise) | ✅ | `/settings`, `/api/settings` |

## Conformité algérienne

- **Décret 05-468** : numérotation continue (FAC-YYYY-NNNN), mentions légales (NIF, NIS, RC, AI)
- **TVA** : 0 / 9 / 19 % par ligne
- **Timbre fiscal** : 2 % (configurable dans `orgs.stamp_rate`)
- **Hébergement** : données en Algérie (Supabase Paris/Francfort → proche, conforme loi 18-07)

## Tarification (prévue)

| Plan | Prix mensuel | Cible |
|---|---|---|
| Gratuit | 0 DA | Auto-entrepreneurs (< 20 factures/mois) |
| Pro | 1 490 DA | PME 1–10 utilisateurs |
| Business | 2 990 DA | PME 10–50 utilisateurs, cabinets |

Voir `docs/phase7-commercial.md` pour le plan d'acquisition.

## Prochaines étapes (v1.1)

- [ ] Formulaires de création (modales / pages `/new`)
- [ ] Détail facture (`/invoices/[id]`) avec boutons Modifier / PDF / Marquer payée
- [ ] Relances impayés (email/WhatsApp)
- [ ] Multi-utilisateurs (rôles owner/member)
- [ ] Export Excel/CSV
- [ ] Assistant IA (rédaction de facture, relance auto)

## Licence

MIT — Conçu en Algérie 🇩🇿