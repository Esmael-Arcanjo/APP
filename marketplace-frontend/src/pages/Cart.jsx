import { Link, useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { money } from "@/lib/api";

export default function Cart() {
  const { items, update, remove, total } = useCart();
  const nav = useNavigate();
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center" data-testid="cart-empty">
        <ShoppingBag className="mx-auto h-16 w-16 text-brand-500" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-ink-500">Descubra produtos incríveis na loja.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
          Ir para a loja
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1fr,360px]" data-testid="cart">
      <div className="space-y-3">
        <h1 className="font-display text-2xl font-extrabold">Seu carrinho</h1>
        {items.map((it) => (
          <div key={it.key} className="flex items-start gap-4 rounded-2xl border border-black/5 bg-white p-4" data-testid={`cart-item-${it.key}`}>
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-brand-50">
              {it.image_url && <img src={it.image_url} alt={it.name} className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              {it.category && (
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-600">{it.category}</p>
              )}
              <p className="line-clamp-2 text-sm font-medium">{it.name}</p>
              <p className="text-xs text-ink-500">por {it.seller_name}</p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {it.size && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">Tam: {it.size}</span>
                )}
                {it.color && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">Cor: {it.color}</span>
                )}
              </div>
              <p className="pt-1 font-bold text-brand-600">{money(it.price_cents, it.currency)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="inline-flex items-center rounded-full border border-black/10">
                <button onClick={() => update(it.key, it.quantity - 1)} className="grid h-8 w-8 place-items-center" data-testid={`qty-minus-${it.key}`}>
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{it.quantity}</span>
                <button onClick={() => update(it.key, it.quantity + 1)} className="grid h-8 w-8 place-items-center" data-testid={`qty-plus-${it.key}`}>
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button onClick={() => remove(it.key)} className="grid h-8 w-8 place-items-center text-red-500 hover:bg-red-50 rounded-full"
                      data-testid={`cart-remove-${it.key}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-2xl border border-black/5 bg-white p-6">
        <h2 className="font-display text-lg font-bold">Resumo</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(total(), items[0]?.currency || "BRL")}</span></div>
          <div className="flex justify-between text-ink-500"><span>Frete</span><span>Calculado no checkout</span></div>
          <div className="border-t border-black/5 pt-3 flex justify-between font-display text-lg font-extrabold">
            <span>Total</span><span className="text-brand-600">{money(total(), items[0]?.currency || "BRL")}</span>
          </div>
        </div>
        <button onClick={() => nav("/checkout")} data-testid="go-checkout"
                className="mt-6 w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
          Finalizar compra
        </button>
      </aside>
    </div>
  );
}
