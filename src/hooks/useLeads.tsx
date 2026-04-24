import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Lead, Stage } from "@/types/lead";
import { loadLeads, newHistory, saveLeads, uid } from "@/lib/storage";

interface LeadsContextValue {
  leads: Lead[];
  addLead: (data: Omit<Lead, "id" | "history" | "createdAt" | "updatedAt" | "stage"> & { stage?: Stage }) => Lead;
  addLeadsBulk: (rows: Array<Partial<Lead>>) => number;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  setStage: (id: string, stage: Stage) => void;
  addNote: (id: string, note: string, nextFollowUp?: string) => void;
  toggleHot: (id: string) => void;
  getLead: (id: string) => Lead | undefined;
}

const Ctx = createContext<LeadsContextValue | null>(null);

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  useEffect(() => {
    if (leads.length >= 0) saveLeads(leads);
  }, [leads]);

  const addLead: LeadsContextValue["addLead"] = useCallback((data) => {
    const now = new Date().toISOString();
    const lead: Lead = {
      id: uid(),
      stage: data.stage ?? "New",
      history: [newHistory("created", `Lead added from ${data.source}`)],
      createdAt: now,
      updatedAt: now,
      ...data,
    } as Lead;
    setLeads((prev) => [lead, ...prev]);
    return lead;
  }, []);

  const addLeadsBulk: LeadsContextValue["addLeadsBulk"] = useCallback((rows) => {
    let added = 0;
    const now = new Date().toISOString();
    const newOnes: Lead[] = rows
      .filter((r) => r.name && r.phone)
      .map((r) => {
        added++;
        return {
          id: uid(),
          name: r.name!,
          phone: String(r.phone!).replace(/\D/g, ""),
          city: r.city ?? "",
          requirement: (r.requirement as Lead["requirement"]) ?? "Other",
          source: (r.source as Lead["source"]) ?? "Just Dial",
          date: r.date ?? new Date().toISOString().slice(0, 10),
          notes: r.notes ?? "",
          stage: (r.stage as Stage) ?? "New",
          history: [newHistory("created", "Imported from CSV")],
          createdAt: now,
          updatedAt: now,
        };
      });
    setLeads((prev) => [...newOnes, ...prev]);
    return added;
  }, []);

  const updateLead: LeadsContextValue["updateLead"] = useCallback((id, patch) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l)),
    );
  }, []);

  const deleteLead: LeadsContextValue["deleteLead"] = useCallback((id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setStage: LeadsContextValue["setStage"] = useCallback((id, stage) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id || l.stage === stage) return l;
        return {
          ...l,
          stage,
          updatedAt: new Date().toISOString(),
          history: [newHistory("stage_change", `Stage changed: ${l.stage} → ${stage}`), ...l.history],
        };
      }),
    );
  }, []);

  const addNote: LeadsContextValue["addNote"] = useCallback((id, note, nextFollowUp) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const entries = [newHistory("note", note)];
        if (nextFollowUp) {
          entries.unshift(newHistory("followup", `Follow-up scheduled for ${nextFollowUp}`));
        }
        return {
          ...l,
          nextFollowUp: nextFollowUp ?? l.nextFollowUp,
          updatedAt: new Date().toISOString(),
          history: [...entries, ...l.history],
        };
      }),
    );
  }, []);

  const toggleHot: LeadsContextValue["toggleHot"] = useCallback((id) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, hot: !l.hot } : l)));
  }, []);

  const getLead = useCallback((id: string) => leads.find((l) => l.id === id), [leads]);

  const value = useMemo(
    () => ({ leads, addLead, addLeadsBulk, updateLead, deleteLead, setStage, addNote, toggleHot, getLead }),
    [leads, addLead, addLeadsBulk, updateLead, deleteLead, setStage, addNote, toggleHot, getLead],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLeads() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLeads must be used within LeadsProvider");
  return ctx;
}
