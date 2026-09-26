import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=anon, obj=logged
  const refresh = useCallback(async () => {
    try { const { data } = await api.get("/mp/auth/me"); setUser(data); return data; }
    catch { setUser(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/mp/auth/login", { email, password });
    setUser(data); return data;
  }, []);
  const register = useCallback(async (payload) => {
    const { data } = await api.post("/mp/auth/register", payload);
    setUser(data); return data;
  }, []);
  const logout = useCallback(async () => {
    try { await api.post("/mp/auth/logout"); } catch {}
    setUser(false);
  }, []);
  return <Ctx.Provider value={{ user, login, register, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
