# Phase 7 — Plan Commercial DZFlow

## 7.1 Positionnement Prix (DZD, TTC)

| Plan | Prix mensuel | Prix annuel | Cible | Inclus |
|---|---|---|---|---|
| **Gratuit** | 0 DA | 0 DA | Auto-entrepreneurs, micro (< 20 factures/mois) | 1 utilisateur, 1 org, factures illimitées, PDF, dashboard, stock, API lecture seule |
| **Pro** | 1 490 DA | 14 900 DA (–17%) | PME 1–10 utilisateurs | Tout Free + multi-utilisateurs (jusqu'à 5), multi-sociétés (2), exports CSV/Excel, webhooks, support email 48h |
| **Business** | 2 990 DA | 29 900 DA (–17%) | PME 10–50 utilisateurs, cabinets | Tout Pro + utilisateurs illimités, multi-sociétés illimité, API complète, SSO (futur), support prioritaire, SLA 99,9% |

**Benchmark concurrentiel (annuel) :**
- Almawarid : 1 200–5 000 DA/mois (sur devis)
- Facturili : 11 900 DA/an (facturation seule)
- Fisira : 11 900 / 22 000 DA/an
- GestiumGO : 15 000 DA/an (licence à vie, local uniquement)
- **DZFlow Pro = 14 900 DA/an** → position « meilleur rapport UX/conformité »

## 7.2 Acquisition des 100 premiers clients (M1–M3)

| Semaine | Action | Cible | KPI |
|---|---|---|---|
| S1–S2 | **Beta fermée** : 10 utilisateurs (réseau fondateur, groupes FB e-com, meetups) | 10 inscrits, 5 actifs | NPS ≥ 40, 0 bug critique |
| S3–S4 | **Contenu SEO** : 8 articles (`comment faire une facture conforme en Algérie`, `TVA 0/9/19%`, `décret 05-468`) + 4 vidéos TikTok/Reels (démo 60s) | 500 visites/mois | 50 inscriptions |
| S5–S6 | **Partenariats comptables** : 5 cabinets → offre « DZFlow pour vos clients » (rev-share 20% à vie) | 5 cabinets | 30 clients via partenaires |
| S7–S8 | **Publicité ciblée** : Meta Ads (intérêt « gestion entreprise », « auto-entrepreneur Algérie ») 300 000 DA budget | 200 inscriptions | CAC < 3 000 DA |
| S9–S12 | **Référencement + bouche-à-oreille** : programme parrainage (1 mois Pro offert par filleul payant) | 100 clients payants | MRR 150 K DA |

## 7.3 Atteindre 1 000 clients (M4–M12)

| Levier | Action | Investissement |
|---|---|---|
| **SEO/Content** | 2 articles/semaine + 1 vidéo/semaine (YT + Reels) | 50 K DA/mois (freelance rédacteur) |
| **Partenariats** | 20 cabinets comptables, 3 banques (BNA, BADR, CPA) → intégration onboarding | 200 K DA (juridique + dev) |
| **Email/Automation** | Séquence onboarding 7 jours (email + in-app) + relance panier abandonné (devis) | Inclus (Next.js + Resend free tier) |
| **Référencement Marketplace** | Inscription sur `AlgeriaTech`, `DzairTech`, annuaires locaux | 0 DA |
| **Product-Led Growth** | Free → Pro in-app upsell (bannière « Vous avez 18 factures ce mois » + CTA upgrade) | Dev 1 semaine |
| **Communauté** | Groupe WhatsApp/Telegram « DZFlow Users » + webinaires mensuels | 20 K DA/mois |

**Objectif M12** : 1 000 clients (≈ 200 Pro + 30 Business) → **MRR ≈ 400 K DA / mois** (≈ 3 000 USD).

## 7.4 Acquisition par canal (estimation M12)

| Canal | % clients | CAC estimé | Volume M12 |
|---|---|---|---|
| Organique (SEO + bouche-à-oreille) | 45% | 1 500 DA | 450 |
| Partenaires (comptables, banques) | 30% | 3 000 DA | 300 |
| Publicité (Meta, Google) | 15% | 8 000 DA | 150 |
| Parrainage | 10% | 500 DA | 100 |

## 7.5 Métriques de santé (North Star)

| Métrique | Objectif M12 |
|---|---|
| MRR | 400 K DA |
| Churn mensuel | < 3% |
| Activation (facture créée J+7) | > 60% |
| NPS | > 50 |
| Temps pour 1ère facture | < 15 min |

## 7.6 Roadmap Produit alignée Vente

| Trimestre | Fonctionnalité | Impact commercial |
|---|---|---|
| Q1 (MVP) | Facturation, CRM, Stock, Dashboard | Vendre Pro |
| Q2 | Multi-utilisateurs, Multi-sociétés, Exports Excel, Webhooks | Vendre Business, retenir Pro |
| Q3 | Assistant IA (rédaction facture, relance auto), Comptabilité SCF légère | Différenciation forte, up-sell |
| Q4 | POS (point de vente), Mobile app (PWA installable), Marketplace intégrations | Nouveaux segments (retail, terrain) |

## 7.7 Risques & Mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Concurrence locale (Almawarid, Fisira) baisse prix | Moyenne | Élevé | Différenciation UX + conformité native + hébergement DZ |
| Réglementation change (LF 2027) | Faible | Moyen | Moteur de calcul configurable (barèmes en DB), mise à jour 1 jour |
| Supabase/Vercel free tier saturé | Moyenne | Faible | Migration Pro pré-budgetée (20$/mois) à 500 users |
| Recrutement dev algérien difficile | Moyenne | Élevé | Codebase clean, tests, docs → onboarding 1 semaine |
| Perte données / faille | Très faible | Critique | RLS 100%, backups quotidiens, audit annuel |

## 7.8 Budget prévisionnel 12 mois (k DA)

| Poste | M1–M3 | M4–M6 | M7–M9 | M10–M12 | Total |
|---|---|---|---|---|---|
| Infra (Vercel Pro + Supabase Pro) | 0 | 80 | 80 | 80 | 240 |
| Marketing (contenu, ads, événements) | 150 | 300 | 400 | 500 | 1 350 |
| Juridique/Comptable (contrats, CGU, RGPD) | 100 | 50 | 50 | 50 | 250 |
| Équipe (1 dev + 1 marketing part-time) | 600 | 900 | 1 200 | 1 500 | 4 200 |
| **Total** | **850** | **1 330** | **1 730** | **2 130** | **6 040** |

**Point mort** : ~150 clients Pro (≈ 2,2 M DA MRR) couvre les coûts fixes à M9.