import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, status, kind, issue_date")
    .eq("org_id", membership.org_id)
    .order("issue_date", { ascending: false })
    .limit(200);

  const ca = (invoices || []).filter((i: any) => i.status === "paid" && i.kind === "invoice").reduce((s: number, i: any) => s + Number(i.total), 0);
  const unpaid = (invoices || []).filter((i: any) => i.status !== "paid" && i.kind === "invoice");
  const unpaidAmount = unpaid.reduce((s: number, i: any) => s + Number(i.total), 0);

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Aperçu de votre activité — {new Date().toLocaleDateString("fr-DZ")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Chiffre d'affaires", value: ca, accent: "primary" },
          { label: "En attente", value: unpaidAmount, accent: "amber" },
          { label: "Factures impayées", value: unpaid.length, accent: "red" },
          { label: "Factures totales", value: (invoices || []).length, accent: "slate" },
        ].map((k) => (
          <div key={k.label} className="card p-6">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{k.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {typeof k.value === "number" && k.value > 999
                ? k.value.toLocaleString("fr-DZ")
                : k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="/invoices/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Nouvelle facture</a>
          <a href="/clients/new" className="btn-secondary rounded-lg px-4 py-2 text-sm">+ Nouveau client</a>
          <a href="/products/new" className="btn-secondary rounded-lg px-4 py-2 text-sm">+ Nouveau produit</a>
        </div>
      </div>

      {unpaid.length > 0 && (
        <div className="mt-6 card border-l-4 border-red-500 p-6">
          <h3 className="font-semibold text-red-700 dark:text-red-300">⚠ Factures en retard</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            {unpaid.slice(0, 5).map((i: any) => (
              <li key={i.status + i.total}>Facture {i.total.toLocaleString("fr-DZ")} DA — statut : {i.status}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}