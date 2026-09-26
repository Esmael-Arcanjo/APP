import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Store, Package, ShoppingBag, Calendar, MessageCircle } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { ProductCard } from "./Home";
import { useAuth } from "@/context/AuthContext";
import { ChatDrawer } from "@/components/ChatDrawer";

export default function SellerStore() {
  const { slug } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [starting, setStarting] = useState(false);
  useEffect(() => {
    api.get(`/shop/store/${slug}`).then((r) => setData(r.data)).catch(() => setData(false));
  }, [slug]);

  const chatSeller = async () => {
    if (!user || typeof user !== "object") { nav(`/login?next=/store/${slug}`); return; }
    if (user.user_type !== "buyer") { toast.error("Apenas compradores podem iniciar conversas"); return; }
    setStarting(true);
    try {
      const r = await api.post("/mp/chat/start", { seller_id: data.seller.id });
      setChatId(r.data.thread_id);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setStarting(false); }
  };
  if (data === null) return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-ink-500">Carregando…</div>;
  if (data === false) return <div className="mx-auto max-w-md px-6 py-16 text-center">
    <Store className="mx-auto h-12 w-12 text-ink-500" />
    <h1 className="mt-4 font-display text-2xl font-extrabold">Loja não encontrada</h1>
  </div>;
  const s = data.seller;
  return (
    <div data-testid="seller-store">
      <section className="relative overflow-hidden border-b border-black/5">
        <div className="relative h-56 bg-gradient-to-r from-brand-500 to-brand-700">
          {s.banner_url && <img src={s.banner_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
        </div>
        <div className="mx-auto -mt-16 max-w-6xl px-6">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-brand-500 text-3xl font-extrabold text-white">
                {s.store_name?.[0]?.toUpperCase() || "L"}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-3xl font-extrabold">{s.store_name}</h1>
                {s.bio && <p className="mt-2 text-sm text-ink-500">{s.bio}</p>}
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500">
                  <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5"/> {data.stats.products} produtos</span>
                  <span className="inline-flex items-center gap-1"><ShoppingBag className="h-3.5 w-3.5"/> {data.stats.orders_completed} pedidos concluídos</span>
                  {s.created_at && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/> Desde {new Date(s.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}</span>}
                </div>
              </div>
              <button onClick={chatSeller} disabled={starting}
                      data-testid="store-chat"
                      className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                <MessageCircle className="h-4 w-4" />
                {starting ? "Abrindo…" : "Falar com a loja"}
              </button>
            </div>
          </div>
        </div>
      </section>
      {chatId && user && (
        <ChatDrawer threadId={chatId} currentUserId={user.id} onClose={() => setChatId(null)} />
      )}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="font-display text-xl font-extrabold">Produtos da loja</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-testid="store-products">
          {data.products.map((p) => <ProductCard key={p.id} p={p} />)}
          {data.products.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-ink-500">
              Esta loja ainda não publicou produtos.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
