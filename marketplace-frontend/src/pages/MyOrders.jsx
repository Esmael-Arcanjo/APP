import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_LABELS = { pending: "Aguardando", processing: "Preparando", shipped: "Enviado", delivered: "Entregue", canceled: "Cancelado" };
const STATUS_COLOR = { pending: "bg-amber-100 text-amber-700", processing: "bg-blue-100 text-blue-700", shipped: "bg-indigo-100 text-indigo-700", delivered: "bg-emerald-100 text-emerald-700", canceled: "bg-red-100 text-red-700" };

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => { if (user) api.get("/mp/my/orders").then((r) => setOrders(r.data)).catch(() => {}); }, [user]);
  if (user === false) return <Navigate to="/login?next=/orders" replace />;
  return (
    <div className="mx-auto max-w-5xl px-6 py-10" data-testid="my-orders">
      <h1 className="font-display text-2xl font-extrabold">Meus pedidos</h1>
      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-ink-500">
          Você ainda não fez pedidos. <Link to="/shop" className="font-medium text-brand-600 hover:underline">Explorar loja</Link>
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-black/5 bg-white p-5" data-testid={`order-${o.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-ink-500">Pedido #{o.id.slice(-8)}</p>
                  <p className="mt-1 font-medium">Vendido por {o.seller_name}</p>
                  <p className="text-xs text-ink-500">{new Date(o.created_at).toLocaleString("pt-BR")}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[o.status] || "bg-black/10"}`}>
                  {STATUS_LABELS[o.status] || o.status}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-black/5">
                {o.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 py-2 text-sm">
                    <Package className="h-4 w-4 text-ink-500" />
                    <span className="flex-1">{it.quantity}× {it.name}</span>
                    <span className="font-medium">{money(it.line_total_cents, o.currency)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
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
