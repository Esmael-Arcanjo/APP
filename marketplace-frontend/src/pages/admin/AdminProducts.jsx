import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EyeOff, Eye, Trash2, RefreshCw, Search } from "lucide-react";
import { api, errMsg, money } from "@/lib/api";

export default function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [only, setOnly] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (only === "active") params.set("active", "true");
      if (only === "hidden") params.set("active", "false");
      const r = await api.get(`/mp/admin/products?${params}`);
      setRows(r.data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [only]);

  const toggle = async (p) => {
    try {
      await api.patch(`/mp/admin/products/${p.id}`, { active: !p.active });
      toast.success(p.active ? "Produto ocultado" : "Produto publicado");
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Excluir "${p.name}"? Essa ação é permanente.`)) return;
    try { await api.delete(`/mp/admin/products/${p.id}`); toast.success("Produto excluído"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div data-testid="admin-products">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Produtos</h1>
          <p className="mt-1 text-sm text-ink-500">Modere anúncios do marketplace.</p>
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome…"
                   className="h-10 w-56 rounded-full border border-black/10 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand-500"
                   data-testid="prod-search" />
          </form>
          <select value={only} onChange={(e) => setOnly(e.target.value)}
                  className="h-10 rounded-full border border-black/10 bg-white px-4 text-sm">
            <option value="">Todos</option>
            <option value="active">Visíveis</option>
            <option value="hidden">Ocultos</option>
          </select>
          <button onClick={load} data-testid="reload-prod"
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-black/5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((p) => (
          <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4"
               data-testid={`ap-${p.id}`}>
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
              {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-medium">{p.name}</p>
              <p className="text-xs text-ink-500">Vendedor: {p.seller_name} · Estoque: {p.stock ?? 0}</p>
            </div>
            <p className="font-display font-extrabold text-brand-600">{money(p.price_cents, p.currency)}</p>
            <span className={`hidden rounded-full px-2 py-0.5 text-xs md:inline-flex ${
              p.active ? "bg-emerald-50 text-emerald-700" : "bg-black/5 text-ink-500"
            }`}>{p.active ? "Visível" : "Oculto"}</span>
            <button onClick={() => toggle(p)} data-testid={`ap-toggle-${p.id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium hover:bg-black/10">
              {p.active ? <><EyeOff className="h-3 w-3" /> Ocultar</> : <><Eye className="h-3 w-3" /> Publicar</>}
            </button>
            <button onClick={() => remove(p)} data-testid={`ap-del-${p.id}`}
                    className="grid h-8 w-8 place-items-center rounded-full text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 p-10 text-center text-sm text-ink-500">
            Nenhum produto encontrado
          </p>
        )}
      </div>
    </div>
  );
}
