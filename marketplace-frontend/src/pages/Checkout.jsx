import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/store/cart";
import { useAuth } from "@/context/AuthContext";
import { api, errMsg, money } from "@/lib/api";
import { CreditCard, ShieldCheck } from "lucide-react";

export default function Checkout() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const nav = useNavigate();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (user === false) return <Navigate to="/login?next=/checkout" replace />;
  if (items.length === 0) return <Navigate to="/cart" replace />;
  if (user && user.user_type !== "buyer") {
    return <div className="mx-auto max-w-md px-6 py-16 text-center text-sm text-ink-500">
      Vendedores não podem comprar por esta conta. Crie uma conta de comprador.
    </div>;
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        items: items.map((it) => ({ product_id: it.id, quantity: it.quantity })),
        shipping_address: address, phone,
        origin_url: window.location.origin,
      };
      const { data } = await api.post("/shop/checkout", payload);
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        nav("/orders");
      }
    } catch (err) {
      toast.error(errMsg(err));
    } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-6 py-10 lg:grid-cols-[1fr,380px]">
      <form onSubmit={submit} className="space-y-6" data-testid="checkout-form">
        <h1 className="font-display text-2xl font-extrabold">Finalizar compra</h1>
        <div>
          <label className="text-sm font-medium">Endereço de entrega</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} required rows="3"
                    placeholder="Rua, número, complemento, bairro, cidade, CEP"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-brand-500"
                    data-testid="checkout-address" />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required
                 placeholder="(11) 99999-0000"
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                 data-testid="checkout-phone" />
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4 text-sm">
          <CreditCard className="mt-0.5 h-5 w-5 text-brand-500" />
          <div>
            <p className="font-medium">Pagamento seguro via Stripe</p>
            <p className="text-xs text-ink-500">
              Você será redirecionado para o checkout seguro do Stripe. Assim que
              aprovado, o vendedor recebe seu pedido para preparo.
            </p>
          </div>
        </div>
        <button type="submit" disabled={loading} data-testid="place-order"
                className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {loading ? "Redirecionando…" : "Pagar com Stripe"}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
          <ShieldCheck className="h-3.5 w-3.5" /> Pagamento protegido — reembolso em caso de disputa
        </p>
      </form>
      <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-display text-base font-bold">Itens</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3">
              <span className="line-clamp-1">{it.quantity}× {it.name}</span>
              <span className="font-semibold">{money(it.price_cents * it.quantity, it.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-black/5 pt-3 flex justify-between font-display text-lg font-extrabold">
          <span>Total</span><span className="text-brand-600">{money(total(), items[0]?.currency || "BRL")}</span>
        </div>
      </aside>
    </div>
  );
}
