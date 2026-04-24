import { Lead, Stage, HistoryEntry } from "@/types/lead";

const LEADS_KEY = "transitcrm.leads.v1";
const AUTH_KEY = "transitcrm.auth.v1";

export const AUTH = {
  username: "admin",
  password: "logistics123",
};

export function isAuthed(): boolean {
  return localStorage.getItem(AUTH_KEY) === "1";
}
export function login(username: string, password: string): boolean {
  if (username === AUTH.username && password === AUTH.password) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(LEADS_KEY);
    if (!raw) return seedLeads();
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

export function saveLeads(leads: Lead[]) {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function newHistory(type: HistoryEntry["type"], message: string): HistoryEntry {
  return { id: uid(), type, message, at: new Date().toISOString() };
}

function seedLeads(): Lead[] {
  const today = new Date().toISOString().slice(0, 10);
  const seed: Lead[] = [
    {
      id: uid(),
      name: "Rajesh Transport Co.",
      phone: "919812345670",
      city: "Mumbai",
      requirement: "Full Truck Load",
      source: "Just Dial",
      date: today,
      notes: "Needs 32ft container, Mumbai → Delhi route, weekly.",
      stage: "Negotiation",
      nextFollowUp: today,
      hot: true,
      history: [newHistory("created", "Lead added from Just Dial")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Anjali Sharma",
      phone: "919900112233",
      city: "Bengaluru",
      requirement: "Courier",
      source: "WhatsApp",
      date: today,
      notes: "Daily document pickups, 5 locations.",
      stage: "Contacted",
      nextFollowUp: today,
      history: [newHistory("created", "Lead added from WhatsApp inquiry")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Steel Mart Pvt Ltd",
      phone: "919765432100",
      city: "Pune",
      requirement: "Part Load",
      source: "Reference",
      date: today,
      notes: "Steel rods, 2 tons, Pune → Nagpur.",
      stage: "New",
      history: [newHistory("created", "Referred by Mr. Khan")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Verma Warehousing",
      phone: "919811223344",
      city: "Delhi",
      requirement: "Warehousing",
      source: "Cold Call",
      date: today,
      notes: "Looking for 5000 sqft in Bhiwandi.",
      stage: "Follow-up Pending",
      nextFollowUp: today,
      hot: true,
      history: [newHistory("created", "Cold called by sales")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Mehta Exports",
      phone: "919900998877",
      city: "Ahmedabad",
      requirement: "Full Truck Load",
      source: "Just Dial",
      date: today,
      notes: "Converted — monthly contract signed.",
      stage: "Converted",
      history: [newHistory("created", "Lead added")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  saveLeads(seed);
  return seed;
}

export const STAGE_LIST: Stage[] = [
  "New",
  "Contacted",
  "Follow-up Pending",
  "Negotiation",
  "Converted",
  "Lost",
];
