import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProductsPage() {
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

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produits</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Catalogue et stocks.</p>
        </div>
        <Link href="/products/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Nouveau</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Produit</th>
              <th className="th">SKU</th>
              <th className="th">Prix vente</th>
              <th className="th">Prix achat</th>
              <th className="th">Stock</th>
              <th className="th">Seuil</th>
            </tr>
          </thead>
          <tbody>
            {(products || []).map((p: any) => {
              const low = Number(p.stock_qty) <= Number(p.min_stock);
              return (
                <tr key={p.id} className={`border-t ${low ? "bg-red-50 dark:bg-red-900/10" : ""} dark:border-surface-dark-border`}>
                  <td className="td font-medium text-slate-900 dark:text-white">{p.name}</td>
                  <td className="td text-slate-500 dark:text-slate-400">{p.sku || "—"}</td>
                  <td className="td">{Number(p.sale_price).toLocaleString("fr-DZ")} DA</td>
                  <td className="td text-slate-500 dark:text-slate-400">{Number(p.purchase_price).toLocaleString("fr-DZ")} DA</td>
                  <td className={`td font-medium ${low ? "text-red-600 dark:text-red-400" : ""}`}>
                    {Number(p.stock_qty).toLocaleString("fr-DZ")}
                  </td>
                  <td className="td text-slate-500 dark:text-slate-400">{Number(p.min_stock).toLocaleString("fr-DZ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}