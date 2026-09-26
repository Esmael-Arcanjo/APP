import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { api, money } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SellerOverview() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    Promise.all([api.get("/mp/seller/products"), api.get("/mp/seller/orders")])
      .then(([p, o]) => { setProducts(p.data); setOrders(o.data); })
      .catch(() => {});
  }, []);

  const revenue = orders.filter((o) => !["canceled", "awaiting_payment"].includes(o.status))
                        .reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const paidCount = orders.filter((o) => !["canceled", "awaiting_payment"].includes(o.status)).length;
  const avgTicket = paidCount ? Math.round(revenue / paidCount) : 0;

  return (
    <div className="space-y-6" data-testid="seller-overview">
      <div>
        <h1 className="font-display text-3xl font-extrabold">{user?.store_name || "Minha loja"}</h1>
        <p className="mt-1 text-sm text-ink-500">Como sua loja está indo hoje.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={Package} label="Produtos" value={products.length} />
        <Card icon={ShoppingBag} label="Pedidos pendentes" value={pending} />
        <Card icon={DollarSign} label="Receita" value={money(revenue)} />
        <Card icon={TrendingUp} label="Tíquete médio" value={money(avgTicket)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/seller/products" data-testid="seller-qk-products"
              className="rounded-2xl border border-black/5 bg-white p-5 hover:shadow-md">
          <p className="font-display text-lg font-bold">Gerenciar produtos</p>
          <p className="mt-1 text-sm text-ink-500">Publique, atualize preço, foto e estoque.</p>
        </Link>
        <Link to="/seller/orders" data-testid="seller-qk-orders"
              className="rounded-2xl border border-black/5 bg-white p-5 hover:shadow-md">
          <p className="font-display text-lg font-bold">Ver pedidos</p>
          <p className="mt-1 text-sm text-ink-500">Atualize o status e envie o pedido.</p>
        </Link>
      </div>
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
