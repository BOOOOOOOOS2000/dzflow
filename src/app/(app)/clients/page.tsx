import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ClientsPage() {
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

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos clients et prospects.</p>
        </div>
        <Link href="/clients/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Nouveau</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Nom</th>
              <th className="th">Type</th>
              <th className="th">Téléphone</th>
              <th className="th">Wilaya</th>
              <th className="th">Créé le</th>
            </tr>
          </thead>
          <tbody>
            {(clients || []).map((c: any) => (
              <tr key={c.id} className="border-t border-surface-border dark:border-surface-dark-border">
                <td className="td font-medium text-slate-900 dark:text-white">{c.name}</td>
                <td className="td">
                  <span className={`badge ${c.is_prospect ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}>
                    {c.is_prospect ? "Prospect" : "Client"}
                  </span>
                </td>
                <td className="td">{c.phone || "—"}</td>
                <td className="td">{c.wilaya || "—"}</td>
                <td className="td text-slate-500 dark:text-slate-400">
                  {new Date(c.created_at).toLocaleDateString("fr-DZ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}