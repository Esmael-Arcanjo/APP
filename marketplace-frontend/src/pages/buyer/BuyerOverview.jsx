import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Clock, Package, ArrowRight } from "lucide-react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BuyerOverview() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/mp/my/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, []);
  const total = orders.filter((o) => o.status !== "canceled" && o.status !== "awaiting_payment")
                      .reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => ["pending", "processing", "shipped"].includes(o.status)).length;

  return (
    <div className="space-y-6" data-testid="buyer-overview">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Olá, {user?.name?.split(" ")[0]} 👋</h1>
        <p className="mt-1 text-sm text-ink-500">Seus pedidos, mensagens e configurações em um só lugar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card icon={ShoppingBag} label="Pedidos" value={orders.length} />
        <Card icon={Clock} label="Em andamento" value={pending} />
        <Card icon={Package} label="Total gasto" value={money(total)} />
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Últimos pedidos</h2>
          <Link to="/buyer/orders" className="text-sm font-medium text-brand-600 hover:underline">Ver todos</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-black/10 p-8 text-center text-sm text-ink-500">
            Você ainda não fez nenhum pedido.{" "}
            <Link to="/shop" className="font-medium text-brand-600 hover:underline">Explorar loja</Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-black/5">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">#{o.id.slice(-8)} — {o.seller_name}</p>
                  <p className="text-xs text-ink-500">{new Date(o.created_at).toLocaleDateString("pt-BR")} · {o.status}</p>
                </div>
                <p className="font-display font-extrabold text-brand-600">{money(o.amount, o.currency)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link to="/shop" data-testid="buyer-shop-cta"
            className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-6 text-white shadow-lg shadow-brand-500/25">
        <div>
          <p className="font-display text-lg font-bold">Continue explorando</p>
          <p className="text-sm text-white/80">Novos produtos toda semana</p>
        </div>
        <ArrowRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

function Card({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-500">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-xs uppercase text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  );
}
