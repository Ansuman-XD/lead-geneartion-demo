import { useState } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function ImportCsvDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addLeadsBulk } = useLeads();
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);

  const handleImport = () => {
    if (!file) return;
    setParsing(true);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (results) => {
        const rows = results.data.map((r) => ({
          name: r["name"] || r["company"] || r["customer name"] || r["customer"] || "",
          phone: r["phone"] || r["mobile"] || r["contact"] || r["phone number"] || "",
          city: r["city"] || r["location"] || "",
          requirement: (r["requirement"] || r["service"] || "Other") as never,
          source: (r["source"] || "Just Dial") as never,
          date: r["date"] || new Date().toISOString().slice(0, 10),
          notes: r["notes"] || r["remarks"] || r["description"] || "",
        }));
        const added = addLeadsBulk(rows);
        setParsing(false);
        if (added > 0) {
          toast.success(`Imported ${added} leads`);
          onOpenChange(false);
          setFile(null);
        } else {
          toast.error("No valid rows found. Need 'name' and 'phone' columns.");
        }
      },
      error: () => {
        setParsing(false);
        toast.error("Could not parse CSV");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import leads from CSV</DialogTitle>
          <DialogDescription>
            Paste a Just Dial export or any CSV with columns like <span className="font-mono text-xs">name, phone, city, requirement, source, notes</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Label
            htmlFor="csv"
            className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-secondary/40 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm font-medium">{file ? file.name : "Click to choose CSV file"}</span>
            <span className="text-xs text-muted-foreground mt-1">.csv files only</span>
            <Input
              id="csv"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </Label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={!file || parsing}>
            {parsing ? "Importing…" : "Import leads"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
