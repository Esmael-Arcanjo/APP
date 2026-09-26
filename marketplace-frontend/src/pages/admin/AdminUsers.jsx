import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Check, Trash2, RefreshCw } from "lucide-react";
import { api, errMsg } from "@/lib/api";

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = type ? `?user_type=${type}` : "";
      const r = await api.get(`/mp/admin/users${q}`);
      setRows(r.data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [type]);

  const toggleBan = async (u) => {
    try {
      await api.post(`/mp/admin/users/${u.id}/ban`, { banned: !u.banned });
      toast.success(u.banned ? "Usuário reativado" : "Usuário banido");
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };
  const remove = async (u) => {
    if (!window.confirm(`Excluir ${u.email}? Essa ação não pode ser desfeita.`)) return;
    try { await api.delete(`/mp/admin/users/${u.id}`); toast.success("Usuário excluído"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div data-testid="admin-users">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Usuários</h1>
          <p className="mt-1 text-sm text-ink-500">Modere vendedores e compradores do marketplace.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={type} onChange={(e) => setType(e.target.value)}
                  className="h-10 rounded-full border border-black/10 bg-white px-4 text-sm"
                  data-testid="filter-user-type">
            <option value="">Todos</option>
            <option value="seller">Vendedores</option>
            <option value="buyer">Compradores</option>
          </select>
          <button onClick={load} data-testid="reload-users"
                  className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-black/5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-black/5 text-left text-xs uppercase text-ink-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Loja / Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {rows.filter((r) => r.user_type !== "admin").map((u) => (
              <tr key={u.id} data-testid={`u-${u.id}`}>
                <td className="px-4 py-3 font-medium">{u.name}</td>
                <td className="px-4 py-3 text-ink-500">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    u.user_type === "seller" ? "bg-brand-50 text-brand-600" : "bg-emerald-50 text-emerald-600"
                  }`}>{u.user_type}</span>
                </td>
                <td className="px-4 py-3 text-ink-500">{u.store_name || "—"}<br/>
                  <span className="text-xs">{u.slug ? `/${u.slug}` : ""}</span>
                </td>
                <td className="px-4 py-3">
                  {u.banned ? <span className="text-red-600">Banido</span> : <span className="text-emerald-600">Ativo</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleBan(u)} data-testid={`ban-${u.id}`}
                          className={`me-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            u.banned ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-black/5 hover:bg-black/10"
                          }`}>
                    {u.banned ? <><Check className="h-3 w-3" /> Reativar</> : <><Ban className="h-3 w-3" /> Banir</>}
                  </button>
                  <button onClick={() => remove(u)} data-testid={`del-${u.id}`}
                          className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100">
                    <Trash2 className="h-3 w-3" /> Excluir
                  </button>
                </td>
              </tr>
            ))}
            {rows.filter((r) => r.user_type !== "admin").length === 0 && (
              <tr><td colSpan="6" className="px-4 py-10 text-center text-ink-500">Nenhum usuário</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
