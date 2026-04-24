import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [u, setU] = useState("admin");
  const [p, setP] = useState("logistics123");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(u, p);
      setLoading(false);
      if (ok) {
        toast.success("Welcome back");
        navigate("/");
      } else {
        toast.error("Invalid credentials");
      }
    }, 200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
      <div className="relative w-full max-w-md surface-card border border-border rounded-2xl p-8 shadow-elegant">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
            <Truck className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">TransitCRM</h1>
            <p className="text-sm text-muted-foreground">Logistics Lead Management</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="u">Username</Label>
            <Input id="u" value={u} onChange={(e) => setU(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p">Password</Label>
            <Input id="p" type="password" value={p} onChange={(e) => setP(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Demo credentials prefilled · <span className="font-mono">admin / logistics123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
