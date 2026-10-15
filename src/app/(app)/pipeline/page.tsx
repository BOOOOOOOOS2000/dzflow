import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PipelinePage() {
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

  const stages = ["lead", "contacted", "proposal", "won", "lost"] as const;
  const dealsByStage = await Promise.all(
    stages.map(async (stage) => {
      const { data } = await supabase
        .from("deals")
        .select("*, clients(name)")
        .eq("org_id", membership.org_id)
        .eq("stage", stage)
        .order("created_at", { ascending: false });
      return { stage, deals: data || [] };
    })
  );

  const stageLabels: Record<string, string> = {
    lead: "Nouveaux",
    contacted: "Contactés",
    proposal: "Propositions",
    won: "Gagnés",
    lost: "Perdus",
  };
  const stageColors: Record<string, string> = {
    lead: "bg-slate-100 dark:bg-slate-800",
    contacted: "bg-blue-100 dark:bg-blue-900/30",
    proposal: "bg-amber-100 dark:bg-amber-900/30",
    won: "bg-green-100 dark:bg-green-900/30",
    lost: "bg-red-100 dark:bg-red-900/30",
  };

  return (
    <main className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pipeline commercial</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos opportunités de vente.</p>
        </div>
        <a href="/pipeline/new" className="btn-primary rounded-lg px-4 py-2 text-sm">+ Opportunity</a>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {dealsByStage.map(({ stage, deals }) => (
          <div key={stage} className={`w-80 flex-shrink-0 rounded-xl ${stageColors[stage]} p-4`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">{stageLabels[stage]}</h3>
              <span className="badge bg-white/80 dark:bg-slate-800">{deals.length}</span>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {deals.map((d: any) => (
                <div key={d.id} className="card p-3">
                  <p className="font-medium text-slate-900 dark:text-white">{d.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{d.clients?.name || "Sans client"}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {Number(d.value).toLocaleString("fr-DZ")} DA
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}