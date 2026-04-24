import { Link } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { Users, CalendarCheck, TrendingUp, Flame, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { stageColor, STAGES, SOURCES } from "@/types/lead";
import { TopBar } from "@/components/TopBar";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

export default function Dashboard() {
  const { leads } = useLeads();
  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);

  const total = leads.length;
  const followUpsToday = leads.filter((l) => l.nextFollowUp === today && l.stage !== "Converted" && l.stage !== "Lost").length;
  const convertedThisMonth = leads.filter((l) => l.stage === "Converted" && l.updatedAt.startsWith(monthKey)).length;
  const hotLeads = leads.filter((l) => l.hot && l.stage !== "Converted" && l.stage !== "Lost").length;

  const stats = [
    { label: "Total Leads", value: total, icon: Users, tone: "text-info", bg: "bg-info/10" },
    { label: "Follow-ups Today", value: followUpsToday, icon: CalendarCheck, tone: "text-warning", bg: "bg-warning/10" },
    { label: "Converted This Month", value: convertedThisMonth, icon: TrendingUp, tone: "text-primary", bg: "bg-primary/10" },
    { label: "Hot Leads", value: hotLeads, icon: Flame, tone: "text-destructive", bg: "bg-destructive/10" },
  ];

  // Stage distribution for pie chart
  const stageData = STAGES.map((s) => ({
    name: s,
    value: leads.filter((l) => l.stage === s).length,
    color: `hsl(var(--${stageColor[s]}))`,
  })).filter((d) => d.value > 0);

  // Sources breakdown
  const sourceData = SOURCES.map((s) => ({
    name: s,
    leads: leads.filter((l) => l.source === s).length,
  }));

  // Last 7 days new leads
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    return {
      day: label,
      new: leads.filter((l) => l.createdAt.slice(0, 10) === key).length,
      converted: leads.filter((l) => l.stage === "Converted" && l.updatedAt.slice(0, 10) === key).length,
    };
  });

  const recent = [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  return (
    <div className="space-y-8 max-w-7xl">
      <TopBar title="Dashboard" subtitle="Overview of your logistics pipeline." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="surface-card p-5 border-border hover:border-primary/30 hover:shadow-glow transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                  <p className="font-display text-3xl font-bold mt-2">{s.value}</p>
                </div>
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", s.bg, s.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="surface-card border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Activity — last 7 days</h2>
              <p className="text-xs text-muted-foreground mt-0.5">New leads vs conversions</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="new" stroke="hsl(var(--info))" strokeWidth={2} fill="url(#gNew)" name="New" />
                <Area type="monotone" dataKey="converted" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gConv)" name="Converted" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="surface-card border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-1">Stage distribution</h2>
          <p className="text-xs text-muted-foreground mb-3">Where leads sit today</p>
          <div className="h-48">
            {stageData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stageData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {stageData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="hsl(var(--card))" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {stageData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                <span className="truncate text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="surface-card border-border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-semibold">Lead sources</h2>
            <Link to="/leads" className="text-xs text-primary hover:underline flex items-center gap-1">
              View leads <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary) / 0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="surface-card border-border p-6">
          <h2 className="font-display text-lg font-semibold mb-5">Recent activity</h2>
          {recent.length === 0 && <p className="text-sm text-muted-foreground">No leads yet.</p>}
          <div className="space-y-1">
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
