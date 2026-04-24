import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLeads } from "@/hooks/useLeads";
import { STAGES, stageColor, Stage } from "@/types/lead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Phone, MessageCircle, Flame, Trash2, Calendar, MessageSquare, ArrowRightLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { telHref, waHref } from "@/lib/phone";

const iconForType = (t: string) => {
  if (t === "stage_change") return ArrowRightLeft;
  if (t === "note") return MessageSquare;
  if (t === "followup") return Calendar;
  return PlusCircle;
};

export default function LeadDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getLead, setStage, addNote, toggleHot, deleteLead, updateLead } = useLeads();
  const lead = getLead(id);

  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="link" onClick={() => navigate("/leads")}>Back to leads</Button>
      </div>
    );
  }

  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim() && !followUp) { toast.error("Add a note or set a follow-up date"); return; }
    addNote(lead.id, note.trim() || "(no note)", followUp || undefined);
    setNote(""); setFollowUp("");
    toast.success("Updated");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">{lead.name}</h1>
            {lead.hot && <Flame className="h-6 w-6 text-warning" fill="currentColor" />}
          </div>
          <p className="text-muted-foreground mt-1 font-mono">{lead.phone}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toggleHot(lead.id)}>
            <Flame className={`h-4 w-4 ${lead.hot ? "text-warning fill-current" : ""}`} />
            {lead.hot ? "Hot" : "Mark hot"}
          </Button>
          <Button asChild variant="outline">
            <a href={telHref(lead.phone)}><Phone className="h-4 w-4" /> Call</a>
          </Button>
          <Button asChild className="bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_38%)] text-white">
            <a href={waHref(lead.phone)} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="surface-card border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Add follow-up note</h2>
            <form onSubmit={submitNote} className="space-y-3">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What did you discuss? Next steps?" />
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1.5">
                  <Label htmlFor="fu" className="text-xs">Next follow-up date</Label>
                  <Input id="fu" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="w-44" />
                </div>
                <Button type="submit" className="ml-auto">Save</Button>
              </div>
            </form>
          </Card>

          <Card className="surface-card border-border p-6">
            <h2 className="font-display text-lg font-semibold mb-4">History & notes</h2>
            <div className="space-y-3">
              {lead.history.map((h) => {
                const Icon = iconForType(h.type);
                return (
                  <div key={h.id} className="flex gap-3 p-3 rounded-lg bg-secondary/40 border border-border/60">
                    <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm whitespace-pre-wrap break-words">{h.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(h.at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="surface-card border-border p-6 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Stage</Label>
              <Select value={lead.stage} onValueChange={(v) => setStage(lead.id, v as Stage)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      <span className="flex items-center gap-2">
                        <span className={`stage-dot bg-${stageColor[s]}`} /> {s}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Detail label="City" value={lead.city || "—"} />
              <Detail label="Source" value={lead.source} />
              <Detail label="Requirement" value={<Badge variant="secondary">{lead.requirement}</Badge>} />
              <Detail label="Date" value={lead.date} />
              <Detail label="Next follow-up" value={lead.nextFollowUp || "—"} />
              <Detail label="Updated" value={new Date(lead.updatedAt).toLocaleDateString()} />
            </div>

            {lead.notes && (
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Initial notes</Label>
                <p className="text-sm mt-2 whitespace-pre-wrap">{lead.notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                onClick={() => {
                  if (confirm("Delete this lead?")) {
                    deleteLead(lead.id);
                    toast.success("Lead deleted");
                    navigate("/leads");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete lead
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className="text-sm mt-0.5">{value}</div>
    </div>
  );
}
