import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bell, CalendarClock, AlarmClock, Flame, Sparkles } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, NotificationKind } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const iconFor: Record<NotificationKind, typeof Bell> = {
  today: CalendarClock,
  overdue: AlarmClock,
  hot: Flame,
  new: Sparkles,
};

const toneFor: Record<NotificationKind, string> = {
  today: "text-warning bg-warning/10",
  overdue: "text-destructive bg-destructive/10",
  hot: "text-warning bg-warning/10",
  new: "text-info bg-info/10",
};

export function NotificationsBell() {
  const { notifications, counts } = useNotifications();
  const announced = useRef<Set<string>>(new Set());

  // Pop a toast for today's follow-ups (once per session per lead)
  useEffect(() => {
    notifications
      .filter((n) => n.kind === "today" || n.kind === "overdue")
      .forEach((n) => {
        if (announced.current.has(n.id)) return;
        announced.current.add(n.id);
        if (n.kind === "today") {
          toast.warning(n.title, { description: n.description });
        } else {
          toast.error(n.title, { description: n.description });
        }
      });
  }, [notifications]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          {counts.total > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center leading-none">
              {counts.total > 99 ? "99+" : counts.total}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[340px] p-0 surface-card border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <div className="font-display font-semibold text-sm">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {counts.overdue} overdue · {counts.today} today · {counts.hot} hot
            </div>
          </div>
        </div>
        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              You're all caught up 🎉
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => {
                const Icon = iconFor[n.kind];
                return (
                  <li key={n.id}>
                    <Link
                      to={`/leads/${n.leadId}`}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-secondary/40 transition-colors"
                    >
                      <span className={cn("h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0", toneFor[n.kind])}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{n.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{n.description}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
