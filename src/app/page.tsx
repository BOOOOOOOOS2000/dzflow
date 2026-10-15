import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface-muted dark:bg-surface-dark">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white font-bold">
            DZ
          </div>
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            DZFlow
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            Se connecter
          </Link>
          <Link href="/register" className="btn-primary rounded-lg px-4 py-2 text-sm">
            Commencer maintenant
          </Link>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
          Votre entreprise, dans une seule app.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          DZFlow centralise vos clients, vos stocks, vos factures et votre trésorerie.
          Conforme à la réglementation algérienne dès la première facture.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/register" className="btn-primary rounded-lg px-6 py-3 text-sm">
            Essai gratuit — sans carte bancaire
          </Link>
          <Link href="#fonctionnalites" className="btn-secondary rounded-lg px-6 py-3 text-sm">
            Découvrir
          </Link>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Tout ce qu'il faut, rien de superflu.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Dashboard intelligent", desc: "CA, dépenses, bénéfices en temps réel. Alertes stock et impayés." },
            { title: "CRM & clients", desc: "Clients, prospects, pipeline commercial, historique complet." },
            { title: "Facturation DGI", desc: "Devis, factures conformes (TVA 0/9/19%, timbre fiscal, QR). Export PDF." },
            { title: "Gestion des stocks", desc: "Produits, entrées/sorties, seuils d'alerte, valeur totale." },
            { title: "Conformité algérienne", desc: "NIF, NIS, RC, numérotation continue, mentions légales." },
            { title: "Hébergé en Algérie", desc: "Vos données restent en Algérie, conformément à la loi 18-07." },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-surface-border px-6 py-8 text-center text-sm text-slate-500 dark:border-surface-dark-border dark:text-slate-400">
        DZFlow — Conçu en Algérie, hébergé en Algérie.
      </footer>
    </main>
  );
}