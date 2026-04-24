import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/hooks/useLeads";
import { REQUIREMENTS, SOURCES, Requirement, Source } from "@/types/lead";
import { toast } from "sonner";

export function AddLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addLead } = useLeads();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [requirement, setRequirement] = useState<Requirement>("Full Truck Load");
  const [source, setSource] = useState<Source>("Just Dial");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName(""); setPhone(""); setCity(""); setNotes("");
    setRequirement("Full Truck Load"); setSource("Just Dial"); setDate(today);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Name and phone are required");
      return;
    }
    const lead = addLead({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      city: city.trim(),
      requirement,
      source,
      date,
      notes: notes.trim(),
    });
    toast.success("Lead added");
    reset();
    onOpenChange(false);
    navigate(`/leads/${lead.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new lead</DialogTitle>
          <DialogDescription>Enter the inquiry details. You can refine status & follow-ups later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="name">Name / Company *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rajesh Transport Co." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="91XXXXXXXXXX" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" />
          </div>
          <div className="space-y-2">
            <Label>Requirement</Label>
            <Select value={requirement} onValueChange={(v) => setRequirement(v as Requirement)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REQUIREMENTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={source} onValueChange={(v) => setSource(v as Source)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Route, tonnage, frequency, special requirements…" />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
