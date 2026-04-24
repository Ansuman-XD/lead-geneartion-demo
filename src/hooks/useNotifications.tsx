import { useMemo } from "react";
import { useLeads } from "@/hooks/useLeads";
import { Lead } from "@/types/lead";

export type NotificationKind = "today" | "overdue" | "hot" | "new";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  leadId: string;
  at?: string;
}

export function useNotifications() {
  const { leads } = useLeads();

  return useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const list: AppNotification[] = [];
    const isActive = (l: Lead) => l.stage !== "Converted" && l.stage !== "Lost";

    leads.filter(isActive).forEach((l) => {
      if (l.nextFollowUp === today) {
        list.push({
          id: `today-${l.id}`,
          kind: "today",
          title: `Follow-up today: ${l.name}`,
          description: `${l.requirement} • ${l.city || "—"}`,
          leadId: l.id,
          at: l.nextFollowUp,
        });
      } else if (l.nextFollowUp && l.nextFollowUp < today) {
        list.push({
          id: `overdue-${l.id}`,
          kind: "overdue",
          title: `Overdue: ${l.name}`,
          description: `Was due ${l.nextFollowUp}`,
          leadId: l.id,
          at: l.nextFollowUp,
        });
      }
      if (l.hot) {
        list.push({
          id: `hot-${l.id}`,
          kind: "hot",
          title: `Hot lead: ${l.name}`,
          description: `${l.requirement} • ${l.stage}`,
          leadId: l.id,
        });
      }
      if (l.stage === "New") {
        list.push({
          id: `new-${l.id}`,
          kind: "new",
          title: `New lead: ${l.name}`,
          description: `From ${l.source}`,
          leadId: l.id,
          at: l.createdAt,
        });
      }
    });

    // priority: overdue, today, hot, new
    const order: Record<NotificationKind, number> = { overdue: 0, today: 1, hot: 2, new: 3 };
    list.sort((a, b) => order[a.kind] - order[b.kind]);

    const counts = {
      total: list.length,
      today: list.filter((n) => n.kind === "today").length,
      overdue: list.filter((n) => n.kind === "overdue").length,
      hot: list.filter((n) => n.kind === "hot").length,
      new: list.filter((n) => n.kind === "new").length,
    };

    return { notifications: list, counts };
  }, [leads]);
}
