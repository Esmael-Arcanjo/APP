import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { api, errMsg, money } from "@/lib/api";

const STATUS = { awaiting_payment: "Aguardando pagto", pending: "Novo", processing: "Preparando",
                 shipped: "Enviado", delivered: "Entregue", canceled: "Cancelado" };

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const q = status ? `?status=${status}` : "";
      const r = await api.get(`/mp/admin/orders${q}`); setRows(r.data);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [status]);
  return (
    <div data-testid="admin-orders">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Pedidos</h1>
          <p className="mt-1 text-sm text-ink-500">Todos os pedidos do marketplace.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} data-testid="filter-order-status"
                  className="h-10 rounded-full border border-black/10 bg-white px-4 text-sm">
            <option value="">Todos os status</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-black/5">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {rows.map((o) => (
          <div key={o.id} className="rounded-2xl border border-black/5 bg-white p-5" data-testid={`ao-${o.id}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-ink-500">#{o.id.slice(-8)} · {new Date(o.created_at).toLocaleString("pt-BR")}</p>
                <p className="mt-1 font-medium">{o.buyer_name} → {o.seller_name}</p>
                <p className="text-xs text-ink-500 truncate">{o.buyer_email} · {o.shipping_address}</p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium">{STATUS[o.status] || o.status}</span>
                <p className="mt-2 font-display text-lg font-extrabold text-brand-600">{money(o.amount, o.currency)}</p>
              </div>
            </div>
            <ul className="mt-3 divide-y divide-black/5 text-sm">
              {(o.items || []).map((it, i) => (
                <li key={i} className="flex justify-between py-1.5">
                  <span>{it.quantity}× {it.name}</span>
                  <span className="font-medium">{money(it.line_total_cents, o.currency)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 p-10 text-center text-sm text-ink-500">
            Nenhum pedido nesse filtro
          </p>
        )}
      </div>
    </div>
  );
}
