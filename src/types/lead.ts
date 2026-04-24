export const STAGES = [
  "New",
  "Contacted",
  "Follow-up Pending",
  "Negotiation",
  "Converted",
  "Lost",
] as const;
export type Stage = (typeof STAGES)[number];

export const REQUIREMENTS = [
  "Full Truck Load",
  "Part Load",
  "Courier",
  "Warehousing",
  "Other",
] as const;
export type Requirement = (typeof REQUIREMENTS)[number];

export const SOURCES = [
  "Just Dial",
  "WhatsApp",
  "Reference",
  "Cold Call",
] as const;
export type Source = (typeof SOURCES)[number];

export interface HistoryEntry {
  id: string;
  type: "created" | "stage_change" | "note" | "followup";
  message: string;
  at: string; // ISO
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  city: string;
  requirement: Requirement;
  source: Source;
  date: string; // ISO yyyy-mm-dd
  notes: string;
  stage: Stage;
  nextFollowUp?: string; // ISO yyyy-mm-dd
  hot?: boolean;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export const stageColor: Record<Stage, string> = {
  "New": "stage-new",
  "Contacted": "stage-contacted",
  "Follow-up Pending": "stage-followup",
  "Negotiation": "stage-negotiation",
  "Converted": "stage-converted",
  "Lost": "stage-lost",
};
