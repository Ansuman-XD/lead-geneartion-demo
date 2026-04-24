import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REQUIREMENTS, STAGES, stageColor } from "@/types/lead";
import { Phone, MessageCircle, Flame, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadsList() {
  const { leads } = useLeads();
  const [q, setQ] = useState("");
  const [stage, setStage] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [req, setReq] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const cities = useMemo(() => Array.from(new Set(leads.map((l) => l.city).filter(Boolean))).sort(), [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (q) {
        const t = q.toLowerCase();
        if (!l.name.toLowerCase().includes(t) && !l.phone.includes(t) && !l.city.toLowerCase().includes(t)) return false;
      }
      if (stage !== "all" && l.stage !== stage) return false;
      if (city !== "all" && l.city !== city) return false;
      if (req !== "all" && l.requirement !== req) return false;
      if (from && l.date < from) return false;
      if (to && l.date > to) return false;
      return true;
    });
  }, [leads, q, stage, city, req, from, to]);

  const clear = () => { setQ(""); setStage("all"); setCity("all"); setReq("all"); setFrom(""); setTo(""); };
  const hasFilter = q || stage !== "all" || city !== "all" || req !== "all" || from || to;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} of {leads.length} leads</p>
        </div>
      </div>

      <Card className="surface-card border-border p-4">
        <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> Filters
          {hasFilter && (
            <Button size="sm" variant="ghost" onClick={clear} className="ml-auto h-7 text-xs">
              <X className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name, phone, city…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger><SelectValue placeholder="Stage" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={req} onValueChange={setReq}>
            <SelectTrigger><SelectValue placeholder="Requirement" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requirements</SelectItem>
              {REQUIREMENTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To" />
          </div>
        </div>
      </Card>

      <Card className="surface-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Lead</th>
                <th className="text-left px-4 py-3 font-medium">City</th>
                <th className="text-left px-4 py-3 font-medium">Requirement</th>
                <th className="text-left px-4 py-3 font-medium">Source</th>
                <th className="text-left px-4 py-3 font-medium">Stage</th>
                <th className="text-left px-4 py-3 font-medium">Follow-up</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b border-border/60 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/leads/${l.id}`} className="font-medium hover:text-primary flex items-center gap-2">
                      {l.hot && <Flame className="h-3.5 w-3.5 text-warning" fill="currentColor" />}
                      {l.name}
                    </Link>
                    <div className="text-xs text-muted-foreground font-mono">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.city || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">{l.requirement}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className={`stage-dot bg-${stageColor[l.stage]}`} />
                      {l.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{l.nextFollowUp || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8">
                        <a href={`tel:${l.phone}`}><Phone className="h-4 w-4" /></a>
                      </Button>
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-[hsl(142_70%_50%)]">
                        <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No leads match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
