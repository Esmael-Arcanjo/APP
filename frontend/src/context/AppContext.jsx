import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, errMsg } from "@/lib/api";
import { translator, localeMeta } from "@/lib/i18n";
import { useAppStore } from "@/store/appStore";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anonymous
  const [organization, setOrganization] = useState(null);
  const [projects, setProjects] = useState([]);
  const { projectId, setProjectId, theme, setTheme, locale, setLocale } = useAppStore();

  const t = useMemo(() => translator(locale), [locale]);
  const meta = useMemo(() => localeMeta(locale), [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = meta.rtl ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [meta, locale]);

  const loadWorkspace = useCallback(async () => {
    const [orgRes, projRes] = await Promise.all([api.get("/organization"), api.get("/projects")]);
    setOrganization(orgRes.data);
    setProjects(projRes.data);
    const stored = useAppStore.getState().projectId;
    if (!projRes.data.find((p) => p.id === stored)) {
      setProjectId(projRes.data[0]?.id || null);
    }
  }, [setProjectId]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        await loadWorkspace();
      } catch {
        setUser(false);
      }
    })();
  }, [loadWorkspace]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data);
    await loadWorkspace();
    return data;
  }, [loadWorkspace]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    setUser(data);
    await loadWorkspace();
    return data;
  }, [loadWorkspace]);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* already expired */ }
    setUser(false);
    setOrganization(null);
    setProjects([]);
  }, []);

  const project = projects.find((p) => p.id === projectId) || projects[0] || null;
  const services = organization?.services || [];

  const value = {
    user, organization, projects, project, projectId: project?.id || null,
    services, setProjectId, login, register, logout, loadWorkspace,
    t, locale, setLocale, meta, theme, setTheme, errMsg,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
