import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      projectId: null,
      theme: "light",
      locale: "pt",
      sidebarCollapsed: false,
      setProjectId: (projectId) => set({ projectId }),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: "leamse-app" }
  )
);
