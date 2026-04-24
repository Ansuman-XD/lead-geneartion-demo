import { Link } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { Users, CalendarCheck, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { stageColor, STAGES } from "@/types/lead";

export default function Dashboard() {
  const { leads } = useLeads();
  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);

  const total = leads.length;
  const followUpsToday = leads.filter((l) => l.nextFollowUp === today && l.stage !== "Converted" && l.stage !== "Lost").length;
  const convertedThisMonth = leads.filter((l) => l.stage === "Converted" && l.updatedAt.startsWith(monthKey)).length;
  const hotLeads = leads.filter((l) => l.hot && l.stage !== "Converted" && l.stage !== "Lost").length;

  const stats = [
    { label: "Total Leads", value: total, icon: Users, tone: "text-info" },
    { label: "Follow-ups Today", value: followUpsToday, icon: CalendarCheck, tone: "text-warning" },
    { label: "Converted This Month", value: convertedThisMonth, icon: TrendingUp, tone: "text-primary" },
    { label: "Hot Leads", value: hotLeads, icon: Flame, tone: "text-destructive" },
  ];

  const stageCounts = STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length }));
  const recent = [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your logistics pipeline.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="surface-card p-5 border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                  <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
                </div>
                <div className={cn("h-10 w-10 rounded-lg bg-secondary flex items-center justify-center", s.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="surface-card border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold">Pipeline overview</h2>
            <Link to="/pipeline" className="text-xs text-primary hover:underline flex items-center gap-1">
              Open Kanban <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {stageCounts.map(({ stage, count }) => {
              const max = Math.max(1, ...stageCounts.map((s) => s.count));
              const pct = (count / max) * 100;
              return (
                <div key={stage} className="flex items-center gap-3">
                  <div className="w-40 flex items-center gap-2 text-sm">
                    <span className={`stage-dot bg-${stageColor[stage]}`} />
                    <span>{stage}</span>
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full bg-${stageColor[stage]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-mono w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="surface-card border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-5">Recent activity</h2>
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
          <div className="space-y-3">
            {recent.map((l) => (
              <Link
                key={l.id}
                to={`/leads/${l.id}`}
                className="flex items-center justify-between gap-2 p-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{l.requirement} · {l.city}</div>
                </div>
                <span className={`stage-dot bg-${stageColor[l.stage]} flex-shrink-0`} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
