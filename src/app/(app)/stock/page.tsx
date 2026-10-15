import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function StockPage() {
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

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*, products(name, sku)")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mouvements de stock</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Historique des entrées et sorties.</p>
        </div>
        <Link href="/stock/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Mouvement</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Produit</th>
              <th className="th">Type</th>
              <th className="th">Quantité</th>
              <th className="th">Motif</th>
              <th className="th">Note</th>
              <th className="th">Date</th>
            </tr>
          </thead>
          <tbody>
            {(movements || []).map((m: any) => (
              <tr key={m.id} className="border-t border-surface-border dark:border-surface-dark-border">
                <td className="td font-medium text-slate-900 dark:text-white">{m.products?.name || "—"}</td>
                <td className="td">
                  <span className={`badge ${m.type === "in" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                    {m.type === "in" ? "Entrée" : "Sortie"}
                  </span>
                </td>
                <td className="td">{Number(m.quantity).toLocaleString("fr-DZ")}</td>
                <td className="td text-slate-600 dark:text-slate-300 capitalize">{m.reason}</td>
                <td className="td text-slate-500 dark:text-slate-400">{m.note || "—"}</td>
                <td className="td text-slate-500 dark:text-slate-400">{new Date(m.created_at).toLocaleDateString("fr-DZ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}