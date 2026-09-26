import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ProductCard } from "./Home";

export default function Shop() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState([]);
  const q = params.get("q") || "";
  const cat = params.get("cat") || "";
  useEffect(() => {
    const qs = new URLSearchParams();
    if (q) qs.set("search", q);
    if (cat) qs.set("category", cat);
    api.get(`/shop/products?${qs}`).then((r) => setProducts(r.data)).catch(() => {});
  }, [q, cat]);
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-3xl font-extrabold">
        {q ? `Resultados para "${q}"` : cat ? cat : "Todos os produtos"}
      </h1>
      <p className="mt-1 text-sm text-ink-500">{products.length} produtos encontrados</p>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4" data-testid="shop-grid">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
      {products.length === 0 && (
        <p className="mt-16 text-center text-sm text-ink-500">Nada encontrado.</p>
      )}
    </div>
  );
}
