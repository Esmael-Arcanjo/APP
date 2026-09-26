import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg, money } from "@/lib/api";

const STATUS = { awaiting_payment: "Aguardando pagto", pending: "Aguardando envio",
                 processing: "Preparando", shipped: "Enviado",
                 delivered: "Entregue", canceled: "Cancelado" };

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const load = async () => {
    try { const { data } = await api.get("/mp/seller/orders"); setOrders(data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await api.patch(`/mp/seller/orders/${id}?status=${status}`); load(); toast.success("Status atualizado"); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6" data-testid="seller-orders">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Pedidos</h1>
        <p className="mt-1 text-sm text-ink-500">Confirme os pagamentos e atualize o status de envio.</p>
      </div>
      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-ink-500">Sem pedidos ainda.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-black/5 bg-white p-5" data-testid={`sorder-${o.id}`}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-ink-500">#{o.id.slice(-8)} · {new Date(o.created_at).toLocaleString("pt-BR")}</p>
                  <p className="mt-1 font-medium">{o.buyer_name} — {o.buyer_email}</p>
                  <p className="text-xs text-ink-500">{o.shipping_address} · {o.phone}</p>
                </div>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1 text-sm"
                        data-testid={`sorder-status-${o.id}`}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <ul className="mt-3 divide-y divide-black/5 text-sm">
                {o.items.map((it, i) => (
                  <li key={i} className="flex items-start justify-between py-2">
                    <div>
                      <p className="font-medium">{it.quantity}× {it.name}</p>
                      <p className="text-xs text-ink-500">
                        {it.category ? `${it.category}` : ""}
                        {it.size ? ` · Tam ${it.size}` : ""}
                        {it.color ? ` · ${it.color}` : ""}
                      </p>
                    </div>
                    <span className="font-medium">{money(it.line_total_cents, o.currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-black/5 pt-3">
                <span className="text-xs text-ink-500">Total</span>
                <span className="font-display text-lg font-extrabold text-brand-600">{money(o.amount, o.currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
