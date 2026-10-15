# Phase 2 — Cahier des Charges DZFlow (MVP v1.0)

## 2.1 Périmètre MVP

| Module | In | Out |
|---|---|---|
| Auth | Email + mot de passe, session Supabase, 1 org par compte | SSO, 2FA |
| Dashboard | CA / dépenses / bénéfices 12 mois, top produits, alertes (stock faible, factures impayées) | Prévisions IA |
| CRM | Clients + prospects, pipeline (prospect→client), historique, fiche client, notes | Marketing, campagnes |
| Facturation | Devis + factures, lignes multiples, TVA 0/9/19%, timbre fiscal, statut (brouillon/envoyée/payée/en retard), numérotation continue, export PDF (impression), relance | Paiement en ligne (v1.1) |
| Stocks | Produits (prix vente/achat, SKU), stock courant, seuil minimum, mouvements entrées/sorties, alertes | Multi-dépôts, barcodes |
| Paramètres | Profil entreprise (NIF, NIS, RC, AI), thème clair/sombre, plan | Multi-utilisateurs (v1.1) |

## 2.2 Exigences fonctionnelles (extrait)

**F-01 Devis/Facture** : création en < 60 s ; sélection client ; lignes (produit ou texte libre) avec qté × PU ; TVA appliquée par ligne (0/9/19%) + timbre fiscal sur TTC ; totaux automatiques ; numérotation FAC-YYYY-NNNN / DEV-YYYY-NNNN continue et sans saut (05-468) ; conversion devis→facture 1 clic ; statuts et dates d'échéance ; PDF A4 avec mentions légales (nom, RC, NIF, adresse, N° facture, montant en lettres).
**F-02 CRM** : fiches nom/téléphone/wilaya/email/notes ; liste filtrable (recherche nom/téléphone) ; conversion prospect→client ; historique factures par client ; CA par client.
**F-03 Stocks** : produits avec coût de revient, prix de vente, stock, seuil d'alerte ; tout débit de stock depuis une facture « vente » (v1.1) ; mouvements manuels entrée/sortie avec motif ; valeur du stock (Σ stock × coût).
**F-04 Dashboard** : CA = Σ factures payées ; dépenses = Σ (stock × coût) des mouvements « in » (approximation MVP) ; bénéfice = CA − dépenses ; graphique 12 mois ; top 5 produits par CA ; alertes : produits sous seuil, factures > 7 j impayées.
**F-05 Conformité** : mentions obligatoires imprimées ; taux TVA configurables (barème changeable par LF) ; données hébergées en Algérie.

## 2.3 Parcours utilisateur clés

**Jour 1 — Karim :**
1. Landed sur dzflow.dz → « Essai gratuit, sans carte » → compte en 60 s (email + mdp)
2. Setup obligatoire 3 champs : raison sociale + NIF + N° RC (pré-rempli dans la facture)
3. Ajoute 3 clients et 5 produits (10 min)
4. Crée sa première facture → PDF → l'envoie par WhatsApp
→ **Aha-moment : sa première facture conforme en moins de 15 min.**

**Fin de mois :** dashboard → « J'ai fait 1,2M DA de CA, 780K de charges, 2 factures en retard (relancer 1 clic). »

**Comptable Amina :** crée N orgs (v1.1 multi-sociétés) et pousse ses clients PME vers DZFlow (canal d'acquisition).

## 2.4 Non-fonctionnel

- Performance : LCP < 2,5 s sur 4G (PWA light, données paginées)
- Sécurité : RLS PostgreSQL par org_id, mots de passe Supabase (argon2), https partout, pas de données personnelles sans consentement, exports auditables
- Disponibilité : Vercel 99,9% + Supabase ; backups automatiques
- i18n : FR par défaut, AR prêt (structure i18n, UI RTL au v1.1)
- Mobile : tous les flux critiques utilisables en 1 pouce (créer facture, voir stock)

## 2.5 Critères d'acceptation MVP

1. Créer un compte → 1ère facture PDF conforme en < 15 min sans assistance
2. 0 erreur de calcul TVA/timbre sur 100 factures test (unit tests sur moteur de calcul)
3. 500 comptes créés sans incident de sécurité (RLS vérifié par tests)
4. NPS > 40 sur 50 premiers utilisateurs payants
