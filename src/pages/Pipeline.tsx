import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Stage, STAGES, stageColor } from "@/types/lead";
import { LeadCard } from "@/components/LeadCard";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { exportLeadsToExcel } from "@/lib/excel";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Pipeline() {
  const { leads, setStage } = useLeads();
  const [dragOver, setDragOver] = useState<Stage | null>(null);

  const onDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/lead-id");
    if (id) {
      setStage(id, stage);
      toast.success(`Moved to ${stage}`);
    }
    setDragOver(null);
  };

  const handleExport = () => {
    if (leads.length === 0) { toast.error("No leads to export"); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    exportLeadsToExcel(leads, `pipeline-${stamp}.xlsx`);
    toast.success(`Exported ${leads.length} leads to Excel`);
  };

  return (
    <div className="space-y-2">
      <TopBar
        title="Pipeline"
        subtitle="Drag leads between stages to update status."
        actions={
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </Button>
        }
      />

      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage);
            const isOver = dragOver === stage;
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
                onDragLeave={() => setDragOver((s) => (s === stage ? null : s))}
                onDrop={(e) => onDrop(e, stage)}
                className={cn(
                  "w-72 flex-shrink-0 rounded-xl border surface-card transition-all",
                  isOver ? "border-primary shadow-glow ring-2 ring-primary/30" : "border-border",
                )}
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`stage-dot bg-${stageColor[stage]}`} />
                    <h3 className="font-semibold text-sm">{stage}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                    {items.length}
                  </span>
                </div>
                <div className="p-3 space-y-2 min-h-[200px] max-h-[calc(100vh-260px)] overflow-y-auto">
                  {items.map((l) => (
                    <LeadCard
                      key={l.id}
                      lead={l}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("text/lead-id", l.id)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                      Drop leads here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
