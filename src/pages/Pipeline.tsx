import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Stage, STAGES, stageColor } from "@/types/lead";
import { LeadCard } from "@/components/LeadCard";
import { cn } from "@/lib/utils";

export default function Pipeline() {
  const { leads, setStage } = useLeads();
  const [dragOver, setDragOver] = useState<Stage | null>(null);

  const onDrop = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/lead-id");
    if (id) setStage(id, stage);
    setDragOver(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground mt-1">Drag leads between stages to update status.</p>
      </div>

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
                  isOver ? "border-primary shadow-glow" : "border-border",
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
