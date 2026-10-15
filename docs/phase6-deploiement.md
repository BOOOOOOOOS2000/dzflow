# Phase 6 — Guide de Déploiement Gratuit (Vercel + Supabase)

## 6.1 Prérequis

- Compte GitHub (gratuit)
- Compte Vercel (gratuit — Hobby)
- Compte Supabase (gratuit — Free tier)
- Node 20+ localement (pour build)

## 6.2 Étape 1 — Projet Supabase

1. Aller sur https://supabase.com → **New Project**
2. Nom : `dzflow-prod` — Région : **EU West (Paris)** ou **EU Central (Francfort)** (proximité Algérie, conformité 18-07)
3. Mot de passe DB → **noter**.
4. Aller dans **SQL Editor** → **New Query** → coller le contenu de `supabase/0001_init.sql` → **Run**.
5. Vérifier : tables `orgs`, `clients`, `products`, `invoices`, `invoice_items`, `stock_movements`, `deals`, `org_members`, `settings`, `doc_sequences`, `audit_logs` créées.
6. **Authentication → Providers** : Email → **Confirm email = OFF** (MVP sans confirmation).
7. **Settings → API** : copier **Project URL** et **anon/public key**.

## 6.3 Étape 2 — Déploiement Vercel

1. Push le repo sur GitHub (public ou privé).
2. Vercel → **Add New Project** → Import GitHub repo.
3. **Framework Preset** : Next.js (auto-détecté).
4. **Environment Variables** (ajouter une par une) :
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...` (anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (service_role — **Secret**, jamais exposé)
   - `NEXT_PUBLIC_APP_NAME` = `DZFlow`
5. **Deploy** — Vercel build (≈ 2–3 min). URL générée : `https://dzflow-xxx.vercel.app`.

## 6.4 Étape 3 — Test post-déploiement

1. Ouvrir l'URL Vercel → page d'accueil.
2. Cliquer « Commencer maintenant » → `/register`.
3. Remplir : Nom entreprise, email, mot de passe (8+).
4. Soumettre → redirection vers `/dashboard` (si org créé).
5. Vérifier : Dashboard affiche 0 CA, 0 impayées.
6. Aller `/clients` → ajouter 1 client.
7. Aller `/invoices/new` → créer une facture test (1 ligne, TVA 19%).
8. Cliquer « Voir » → bouton « Télécharger PDF » → PDF valide (mentions NIF/RC).

## 6.5 Étape 4 — Configuration production (optionnel mais recommandé)

| Action | Pourquoi |
|---|---|
| Domaine custom `dzflow.dz` / `app.dzflow.dz` | Marque, confiance |
| Supabase → Auth → URL Configuration → Site URL = domaine Vercel | Redirections magic link correctes |
| Vercel → Project Settings → Functions → Max Duration = 60s | PDF generation peut prendre quelques secondes |
| Supabase → Database → Backups → Daily (gratuit) | Sécurité |
| Supabase → Logs → Activer `pg_stat_statements` | Audit perfs |

## 6.6 Coûts à l'échelle

| Ressource | Free tier | Prochain palier (payant) |
|---|---|---|
| Supabase DB | 500 Mo | 8 $/mois (Pro) |
| Supabase Auth | 50 000 MAU | Inclus Pro |
| Supabase Bandwidth | 2 Go | 0,09 $/Go |
| Vercel Bandwidth | 100 Go/mois | 20 $/mois (Pro) |
| Vercel Functions | 125k invocations/mois | Pro |
| **Seuil rentabilité** | ~1 500 users actifs | CA ≈ 2,5 M DZD/mois → infra < 1 % |

## 6.7 Rollback / Incident

- Vercel : **Instant Rollback** (bouton « Rollback » sur le déploiement précédent).
- Supabase : **Point-in-time recovery** (PITR) sur Pro ; sur Free, backup quotidien manuel via `pg_dump` si critique.

## 6.8 Checklist Go-Live

- [ ] Migration SQL appliquée sans erreur
- [ ] RLS activé sur TOUTES les tables (`select * from pg_policies where schemaname='public'`)
- [ ] `create_org_for_user` RPC testée (signup → org créée + membership owner)
- [ ] PDF facture généré + mentions légales vérifiées
- [ ] Variables d'env Vercel toutes présentes (pas de `undefined` dans logs)
- [ ] Test mobile (Chrome DevTools device toolbar) : sidebar drawer, tableaux scroll
- [ ] Test dark mode : toggle persiste dans localStorage
- [ ] `npm run build` local sans erreur (`exit 0`)