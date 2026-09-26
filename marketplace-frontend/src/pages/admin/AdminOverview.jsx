import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, ShoppingBag, Package, DollarSign, TrendingUp, Store } from "lucide-react";
import { api, errMsg, money } from "@/lib/api";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/mp/admin/stats").then((r) => setStats(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);
  const s = stats || {};
  const cards = [
    { icon: Store, label: "Vendedores", value: s.sellers ?? "—", accent: "bg-brand-500" },
    { icon: Users, label: "Compradores", value: s.buyers ?? "—", accent: "bg-emerald-500" },
    { icon: Package, label: "Produtos ativos", value: `${s.products_active ?? 0}/${s.products_total ?? 0}`, accent: "bg-indigo-500" },
    { icon: ShoppingBag, label: "Pedidos pagos", value: `${s.orders_paid ?? 0}/${s.orders_total ?? 0}`, accent: "bg-fuchsia-500" },
    { icon: DollarSign, label: "Receita bruta (BRL)", value: money(s.revenue_cents || 0), accent: "bg-amber-500" },
    { icon: TrendingUp, label: "Tíquete médio", value: s.orders_paid ? money(Math.round((s.revenue_cents || 0) / s.orders_paid)) : "—", accent: "bg-rose-500" },
  ];
  return (
    <div data-testid="admin-overview">
      <h1 className="font-display text-2xl font-extrabold">Visão geral</h1>
      <p className="mt-1 text-sm text-ink-500">Métricas em tempo real do marketplace.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-black/5 bg-white p-5">
            <span className={`grid h-9 w-9 place-items-center rounded-lg text-white ${c.accent}`}>
              <c.icon className="h-4 w-4" />
            </span>
            <p className="mt-4 text-xs uppercase tracking-wide text-ink-500">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
