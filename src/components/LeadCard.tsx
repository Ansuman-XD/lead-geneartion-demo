import { Lead, stageColor } from "@/types/lead";
import { Link } from "react-router-dom";
import { Phone, MessageCircle, Flame, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { telHref, waHref } from "@/lib/phone";
import { toast } from "sonner";

interface Props {
  lead: Lead;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export function LeadCard({ lead, draggable, onDragStart }: Props) {
  const wa = waHref(lead.phone);
  const tel = telHref(lead.phone);

  const handleCall = (e: React.MouseEvent) => {
    if (tel === "#") {
      e.preventDefault();
      toast.error("No phone number on file");
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className={cn(
        "group surface-card border border-border rounded-lg p-3 hover:border-primary/50 hover:shadow-glow hover:-translate-y-0.5 transition-all",
        draggable && "cursor-grab active:cursor-grabbing",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Link to={`/leads/${lead.id}`} className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-1">
          {lead.name}
        </Link>
        {lead.hot && <Flame className="h-4 w-4 text-warning flex-shrink-0" fill="currentColor" />}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 h-5">
          {lead.requirement}
        </Badge>
        <Badge variant="outline" className={cn("text-[10px] font-medium px-1.5 py-0 h-5", `border-${stageColor[lead.stage]}/40 text-${stageColor[lead.stage]}`)}>
          <span className={`stage-dot bg-${stageColor[lead.stage]} mr-1`} /> {lead.source}
        </Badge>
      </div>

      <div className="space-y-1 text-xs text-muted-foreground mb-3">
        {lead.city && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> {lead.city}
          </div>
        )}
        {lead.nextFollowUp && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Follow-up: {lead.nextFollowUp}
          </div>
        )}
      </div>

      <div className="flex gap-1.5">
        <Button asChild size="sm" variant="outline" className="flex-1 h-8 text-xs">
          <a href={tel} onClick={handleCall}><Phone className="h-3 w-3" /> Call</a>
        </Button>
        <Button asChild size="sm" className="flex-1 h-8 text-xs bg-[hsl(142_70%_45%)] hover:bg-[hsl(142_70%_38%)] text-white">
          <a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-3 w-3" /> WhatsApp</a>
        </Button>
      </div>
    </div>
  );
}
