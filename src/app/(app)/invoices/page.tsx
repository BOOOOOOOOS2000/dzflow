import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function InvoicesPage() {
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
    .select("*, clients(name)")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
    sent: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    cancelled: "bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-400",
  };

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Factures</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Toutes vos factures et devis.</p>
        </div>
        <Link href="/invoices/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Nouvelle</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Numéro</th>
              <th className="th">Client</th>
              <th className="th">Type</th>
              <th className="th">Statut</th>
              <th className="th">Date</th>
              <th className="th text-right">Montant</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {(invoices || []).map((inv: any) => (
              <tr key={inv.id} className="border-t border-surface-border dark:border-surface-dark-border">
                <td className="td font-medium text-slate-900 dark:text-white">{inv.number}</td>
                <td className="td">{inv.clients?.name || "—"}</td>
                <td className="td">{inv.kind === "invoice" ? "Facture" : "Devis"}</td>
                <td className="td">
                  <span className={`badge ${statusColors[inv.status] || ""}`}>{inv.status}</span>
                </td>
                <td className="td">{new Date(inv.issue_date).toLocaleDateString("fr-DZ")}</td>
                <td className="td text-right font-medium">{Number(inv.total).toLocaleString("fr-DZ")} DA</td>
                <td className="td">
                  <a href={`/invoices/${inv.id}`} className="text-primary-600 hover:underline text-sm">Voir</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}