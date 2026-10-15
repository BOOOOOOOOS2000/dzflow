# Phase 4 — Maquettes & Spécifications d'écrans

## 4.1 Principes UX/UI (Stripe / Linear / Notion / Vercel)

| Principe | Application |
|---|---|
| **Clarté avant tout** | Espace blanc généreux, hiérarchie visuelle (titres 2xl/3xl, labels 14px, données 16px) |
| **Feedback instantané** | États hover/active/focus visibles, toasts pour actions, skeletons au chargement |
| **Mobile-first** | Breakpoint `lg:pl-64` pour sidebar ; mobile = drawer + bottom nav (futur) |
| **Dark mode natif** | `class` strategy, tokens `surface-dark`, `surface-dark-muted` |
| **Accessibilité** | Contraste AA, focus-visible, labels `htmlFor`, rôles ARIA sur dialog/nav |
| **Vitesse perçue** | RSC pour listes, pas de spinner full-page, préchargement liens `next/link` |

## 4.2 Palette & Tokens (tailwind.config.ts)

```ts
colors: {
  primary: { 50..950 },      // bleu professionnel #3b82f6 (600)
  surface: {
    DEFAULT: "#ffffff",
    muted: "#f8fafc",
    border: "#e2e8f0",
    dark: "#0f172a",
    "dark-muted": "#1e293b",
    "dark-border": "#334155",
  },
}
```

**Usage** : `bg-surface-muted`, `text-slate-900`, `dark:bg-surface-dark`, `dark:text-slate-100`.
Badges : `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`.

## 4.3 Écrans détaillés

### 4.3.1 Landing (`/`) — page.tsx
| Zone | Contenu |
|---|---|
| Hero | Titre H1 5xl, sous-titre, 2 CTA (Primaire « Essai gratuit », Secondaire « Découvrir ») |
| Features | Grille 3 colonnes × 2 lignes : Dashboard, CRM, Facturation, Stocks, Conformité, Hébergement DZ |
| Footer | Copyright + mention « Hébergé en Algérie » |

### 4.3.2 Auth
- **Login (`/login`)** : Email + mot de passe, lien « Créer un compte » → `/register`
- **Register (`/register`)** : Nom entreprise + email + mot de passe → POST `/api/register`

### 4.3.3 App Shell (`(app)/layout.tsx`)
- **Sidebar (lg:fixed w-64)** : Logo DZFlow, 6 items nav (Dashboard, Clients, Factures, Produits, Pipeline, Paramètres), toggle thème (Système/Clair/Sombre), version mobile drawer
- **Topbar (sticky h-16)** : Hamburger mobile, date FR, (futur : profil utilisateur, notifications)
- **Main** : `flex-1 p-4 lg:p-8` — chaque page y rend son contenu

### 4.3.4 Dashboard (`/dashboard`)
| Composant | Détails |
|---|---|
| KPI Cards (4) | CA (vert), En attente (ambre), Impayées (rouge), Total (slate) — valeurs formatDZD |
| Actions rapides | 3 boutons : +Facture, +Client, +Produit (href vers pages new) |
| Alertes | Liste « Factures en retard » si impayées > 0 (border-l-4 rouge) |

### 4.3.5 Clients (`/clients`)
Tableau : Nom | Type (badge Prospect/Client) | Téléphone | Wilaya | Date création.
CTA header : `+ Nouveau` → `/clients/new` (futur modal).

### 4.3.6 Factures (`/invoices`)
Tableau : Numéro | Client | Type (Facture/Devis) | Statut (badge coloré) | Date | Montant | Action « Voir ».
Lien « Voir » → `/invoices/[id]` (détail + bouton PDF).

### 4.3.7 Produits (`/products`)
Tableau : Produit | SKU | Prix vente | Prix achat | Stock | Seuil.
Ligne stock ≤ seuil → `bg-red-50 dark:bg-red-900/10` + texte rouge.

### 4.3.8 Stock (`/stock`)
Mouvements : Produit | Type (Entrée/Sortie badge) | Qté | Motif | Note | Date.

### 4.3.9 Pipeline (`/pipeline`)
5 colonnes Kanban (lead, contacted, proposal, won, lost). Cartes : titre, client, valeur.
Colonnes colorées par étape (slate/blue/amber/green/red).

### 4.3.10 Paramètres (`/settings`)
Formulaire profil (nom, forme juridique, NIF, RC, adresse, téléphone) → POST `/api/settings`.
Affichage plan actuel (free/pro/business).

### 4.3.11 PDF Facture (`/api/invoice-pdf/[id]`)
Généré via **pdfkit** : en-tête org (NIF, RC, adresse), client, tableau lignes (désignation, qté, PU HT, TVA%, total HT), totaux (HT, TVA, timbre, TTC), mentions légales bas de page. Conforme décret 05-468.

## 4.4 États d'UI (à couvrir)
- Loading : skeleton rows (tableaux), spinner boutons (disabled)
- Empty : illustration + CTA (« Ajoutez votre premier client »)
- Error : toast rouge (non bloquant) + retry
- Success : toast vert + redirect si création

## 4.5 Responsive
| Breakpoint | Comportement |
|---|---|
| `< 640px` | Sidebar drawer, cartes KPI 1 col, tableaux scroll horizontal |
| `640–1024` | Sidebar drawer, KPI 2 col |
| `≥ 1024` | Sidebar fixe, KPI 4 col, Kanban 5 colonnes |