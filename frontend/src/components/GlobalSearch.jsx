import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";

const GROUPS = [
  { key: "customers", route: "/app/customers" },
  { key: "products", route: "/app/products" },
  { key: "orders", route: "/app/orders" },
  { key: "sellers", route: "/app/sellers" },
  { key: "emails", route: "/app/emails" },
];

export const GlobalSearch = ({ open, setOpen }) => {
  const { projectId, t } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setOpen]);

  useEffect(() => {
    if (!open || !projectId || query.trim().length < 1) { setResults({}); return; }
    const id = setTimeout(async () => {
      try {
        const { data } = await api.get("/dashboard/search", { params: { project_id: projectId, q: query } });
        setResults(data);
      } catch { setResults({}); }
    }, 220);
    return () => clearTimeout(id);
  }, [query, open, projectId]);

  const total = GROUPS.reduce((acc, g) => acc + (results[g.key]?.length || 0), 0);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        data-testid="global-search-input"
        value={query}
        onValueChange={setQuery}
        placeholder={t("common.searchAll")}
      />
      <CommandList data-testid="global-search-results">
        {total === 0 && <CommandEmpty>{t("common.empty")}</CommandEmpty>}
        {GROUPS.map((g) =>
          (results[g.key]?.length ? (
            <CommandGroup key={g.key} heading={t(`nav.${g.key}`)}>
              {results[g.key].map((item) => (
                <CommandItem
                  key={`${g.key}-${item.id}`}
                  value={`${g.key}-${item.id}-${item.label}`}
                  onSelect={() => { setOpen(false); navigate(g.route); }}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.sub}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null)
        )}
      </CommandList>
    </CommandDialog>
  );
};
