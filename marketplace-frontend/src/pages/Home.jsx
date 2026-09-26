import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api, money } from "@/lib/api";
import { ArrowRight, Sparkles, Truck, ShieldCheck, Star } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    api.get("/shop/products?limit=60").then((r) => setProducts(r.data)).catch(() => {});
    api.get("/shop/categories").then((r) => setCats(r.data)).catch(() => {});
  }, []);

  const visible = useMemo(
    () => (active ? products.filter((p) => p.category === active) : products),
    [products, active],
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-br from-white via-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-600 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> Novos vendedores toda semana
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold sm:text-5xl">
            O marketplace com <span className="text-brand-500">tudo o que você precisa</span>, entregue no seu ritmo.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-500">
            Milhares de produtos de vendedores verificados. Pagamento seguro, entrega rastreada e suporte que responde de verdade.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600" data-testid="home-shop-cta">
              Explorar loja <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/register/seller" className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-3 font-semibold hover:bg-black/5" data-testid="home-sell-cta">
              Quero vender
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-brand-500"/> Frete para todo o Brasil</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-500"/> Pagamento protegido via Stripe</span>
            <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 text-brand-500"/> Avaliação real dos vendedores</span>
          </div>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="sticky top-16 z-20 border-b border-black/5 bg-white/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-4" data-testid="home-categories">
            <button onClick={() => setActive("")}
                    data-testid="cat-all"
                    className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                      active === "" ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white hover:border-brand-500"
                    }`}>
              Tudo
            </button>
            {cats.map((c) => (
              <button key={c} onClick={() => setActive(c)}
                      data-testid={`cat-${c}`}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap ${
                        active === c ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white hover:border-brand-500"
                      }`}>
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl font-extrabold">
            {active || "Todos os produtos"}
          </h2>
          <p className="text-sm text-ink-500">{visible.length} produtos</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" data-testid="home-featured">
          {visible.map((p) => <ProductCard key={p.id} p={p} />)}
          {visible.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-ink-500">
              Sem produtos nessa categoria ainda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function ProductCard({ p }) {
  const img = (p.images && p.images[0]) || p.image_url;
  return (
    <Link to={`/product/${p.id}`} data-testid={`product-card-${p.id}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white transition hover:shadow-lg hover:-translate-y-0.5">
      <div className="relative aspect-square overflow-hidden bg-brand-50">
        {img
          ? <img src={img} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
          : <div className="grid h-full place-items-center text-4xl text-brand-500 font-display">Wibaza</div>}
        {p.category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-700 shadow-sm">
            {p.category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 text-sm font-medium">{p.name}</p>
        <p className="mt-1 text-xs text-ink-500">por {p.seller_name}</p>
        <p className="mt-auto pt-3 font-display text-lg font-extrabold text-brand-600">
          {money(p.price_cents, p.currency)}
        </p>
      </div>
    </Link>
  );
}
