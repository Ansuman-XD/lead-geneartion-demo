import * as XLSX from "xlsx";
import { Lead } from "@/types/lead";

export function exportLeadsToExcel(leads: Lead[], filename = "leads.xlsx") {
  const rows = leads.map((l) => ({
    Name: l.name,
    Phone: l.phone,
    City: l.city,
    Requirement: l.requirement,
    Source: l.source,
    Stage: l.stage,
    Hot: l.hot ? "Yes" : "",
    Date: l.date,
    "Next Follow-up": l.nextFollowUp ?? "",
    Notes: l.notes,
    "Created At": l.createdAt.slice(0, 10),
    "Updated At": l.updatedAt.slice(0, 10),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 22 }, { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
    { wch: 18 }, { wch: 6 }, { wch: 12 }, { wch: 14 }, { wch: 40 },
    { wch: 12 }, { wch: 12 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  XLSX.writeFile(wb, filename);
}
