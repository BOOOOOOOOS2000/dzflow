# Phase 1 — Analyse Métier DZFlow

## 1.1 Problème

80-90% des PME et micro-entreprises algériennes gèrent leur activité avec Excel, WhatsApp, papier ou 3-5 logiciels isolés. Conséquences mesurables :

| Symptôme | Impact |
|---|---|
| Factures dans Excel/Word | Erreurs de TVA/timbre, non-conformité décret 05-468, litiges DGI |
| Clients dans WhatsApp | Perte de prospects, pas d'historique, pas de relance systématique |
| Stock mental ou classeur | Ruptures, sur-stockage, double-vente (multi-canaux) |
| Pas de tableau de bord | Décisions à l'aveugle, trésorerie inconnue |
| Données dans 5 outils | 3-5 h/semaine de ressaisie |

## 1.2 Marché (données de l'étude 2026)

- ~1M de commerçants enregistrés (base TPE) + 200 000 marchands en ligne + 10 000 auto-entrepreneurs (ANAE, croissant)
- Marché logiciel de gestion adressable : 100 000-200 000 entreprises (TPE/PME formelles + auto-entrepreneurs)
- Concurrence locale : Almawarid (ERP complet, 16 ans), Facturili, Fisira (11 900 DZD/an), GestiumGO (licence à vie), Smart Bilan (comptabilité IA)
- **Lacune exploitée** : tous les concurrents sont pensés « logiciel comptable ». Aucun ne propose l'expérience **SaaS moderne mobile-first (Stripe/Linear-grade)** pour le gérant qui n'est pas comptable. DZFlow gagne sur l'adoption, pas sur la complétude comptable.
- Facture de la réglementation : loi 18-05 (e-commerce), décret 05-468 (facturation), Finance Law 2026 (taxation de l'informel) → la conformité est un besoin tiré par la peur, en croissance.

## 1.3 Personas

**P1 — Karim, gérant de PME (32 ans, Oran)**
SARL de négoce, 8 employés, 400-800 factures/an. Utilise Excel + Word + WhatsApp. Douloureux : fin de mois, calcul TVA, relance impayés. Objectifs : savoir combien il gagne réellement, relancer automatiquement, arrêter les erreurs de facturation. Budget : 1 000-2 500 DZD/mois. Kanban : « Je veux voir mon chiffre d'affaires sans ouvrir 4 fichiers Excel. »

**P2 — Amina, comptable / cabinet (40 ans, Alger)**
Tient les comptes de 15 PME clientes. Douloureux : collecte des pièces, ressaisie, relance des dossiers. Objectifs : portail client où chaque PME dépose ses pièces, exports DGI prêts. C'est le **multiplicateur de canal** : 1 comptable = 10-30 PME.

**P3 — Sofiane, auto-entrepreneur e-commerce (26 ans, Sétif)**
Vend sur Facebook/WhatsApp, 0,5% IFU. Douloureux : factures conformes minimales, suivi stock, connaître son bénéfice net. Objectifs : gratuit ou quasi-gratuit, mobile, 2 min par jour.

## 1.4 Positionnement stratégique

**Catégorie créée :** « La gestion simple pour l'entreprise algérienne » — pas un ERP (trop lourd), pas un logiciel de comptable (pas humain), un **OS de gestion quotidien** conforme DGI dès la première facture.

**Promesse :** *Votre entreprise dans une seule app, conforme dès la première facture.*

**Différenciateurs vs concurrents :**
1. Expérience UX de niveau Stripe/Linear (mode sombre, mobile-first, 3 clics max par action)
2. Conforme DGI par design : TVA 0/9/19%, timbre fiscal, NIF/NIS/RC, numérotation continue, QR
3. Données hébergées en Algérie (loi 18-07) — argument vs Odoo/Zoho
4. Gratuit pour démarrer (plan Free), sans carte CIB (pain point : personne n'a de Visa)
5. FR + AR natifs

**Moat :** conformité fine (mises à jour barèmes chaque LF), data d'usage (modèles de facture algérienne), canal comptables (portail multi-sociétés), communauté.

**Non-goals MVP (délibérés)** : pas de comptabilité complète (SCF), pas de paie, pas de POS — modules premium post-v1.
