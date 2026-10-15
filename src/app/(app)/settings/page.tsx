import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  if (!membership) redirect("/register");

  const { data: org } = await supabase
    .from("orgs")
    .select("*")
    .eq("id", membership.org_id)
    .single();

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>

      <div className="card p-6 space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Profil de l'entreprise</h2>
          <form action="/api/settings" method="POST" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Nom</label>
              <input id="name" name="name" defaultValue={org?.name || ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="legal_form">Forme juridique</label>
              <select id="legal_form" name="legal_form" className="input">
                <option value="">—</option>
                <option value="SARL">SARL</option>
                <option value="EURL">EURL</option>
                <option value="SPA">SPA</option>
                <option value="Entreprise individuelle">Entreprise individuelle</option>
                <option value="Auto-entrepreneur">Auto-entrepreneur</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="nif">NIF</label>
              <input id="nif" name="nif" defaultValue={org?.nif || ""} className="input" placeholder="Ex: 1234567890123" />
            </div>
            <div>
              <label className="label" htmlFor="rc">N° RC</label>
              <input id="rc" name="rc" defaultValue={org?.rc || ""} className="input" placeholder="Ex: 16 ALG 2023" />
            </div>
            <div>
              <label className="label" htmlFor="address">Adresse</label>
              <input id="address" name="address" defaultValue={org?.address || ""} className="input" placeholder="Adresse complète" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Téléphone</label>
              <input id="phone" name="phone" type="tel" defaultValue={org?.phone || ""} className="input" placeholder="0550 12 34 56" />
            </div>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Plan & Facturation</h2>
          <div className="card p-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Plan actuel : <strong className="capitalize">{org?.plan || "free"}</strong>
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Les fonctionnalités avancées (multi-utilisateurs, multi-sociétés, IA) arrivent bientôt.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}