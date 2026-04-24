import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { isAuthed, login as doLogin, logout as doLogout } from "@/lib/storage";

interface AuthCtx {
  authed: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(isAuthed()), []);
  return (
    <Ctx.Provider
      value={{
        authed,
        login: (u, p) => {
          const ok = doLogin(u, p);
          if (ok) setAuthed(true);
          return ok;
        },
        logout: () => {
          doLogout();
          setAuthed(false);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
