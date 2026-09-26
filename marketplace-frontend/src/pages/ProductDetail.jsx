import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShoppingBag, Store, Package, Minus, Plus, Star, MessageCircle } from "lucide-react";
import { api, errMsg, money } from "@/lib/api";
import { useCart } from "@/store/cart";
import { useAuth } from "@/context/AuthContext";
import { ChatDrawer } from "@/components/ChatDrawer";

function Stars({ value, size = 4, onPick }) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={onPick ? () => onPick(n) : undefined}
                aria-label={`${n} estrelas`}
                className={onPick ? "cursor-pointer" : "cursor-default"}
                data-testid={onPick ? `star-${n}` : undefined}>
          <Star className={`h-${size} w-${size} ${n <= value ? "fill-brand-500 text-brand-500" : "text-ink-300"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [startingChat, setStartingChat] = useState(false);
  const add = useCart((s) => s.add);

  const load = () => {
    api.get(`/shop/products/${id}`).then((r) => {
      setP(r.data);
      setActiveImg(0);
      setSize((r.data.sizes && r.data.sizes[0]) || "");
      setColor((r.data.colors && r.data.colors[0]) || "");
    }).catch((e) => toast.error(errMsg(e)));
    api.get(`/shop/products/${id}/reviews`).then((r) => setReviews(r.data)).catch(() => {});
  };
  useEffect(load, [id]);

  const startChat = async () => {
    if (!user || typeof user !== "object") { nav(`/login?next=/product/${id}`); return; }
    if (user.user_type !== "buyer") { toast.error("Apenas compradores podem iniciar conversas"); return; }
    setStartingChat(true);
    try {
      const r = await api.post("/mp/chat/start", { seller_id: p.seller_id, product_id: p.id });
      setChatId(r.data.thread_id);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setStartingChat(false); }
  };

  if (!p) return <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-ink-500">Carregando…</div>;

  const hasSizes = (p.sizes || []).filter((s) => s && s !== "Único").length > 0;
  const hasColors = (p.colors || []).filter((c) => c && c !== "Único").length > 0;
  const needsSize = hasSizes && !size;
  const needsColor = hasColors && !color;

  const doAdd = (redirect = false) => {
    if (needsSize) { toast.error("Escolha um tamanho"); return; }
    if (needsColor) { toast.error("Escolha uma cor"); return; }
    add(p, qty, { size, color });
    toast.success("Adicionado ao carrinho");
    if (redirect) nav("/cart");
  };

  const gallery = (p.images && p.images.length ? p.images : [p.image_url].filter(Boolean));
  const canReview = user && user.user_type === "buyer";
  const alreadyReviewed = reviews.some((r) => r.buyer_id === user?.id);
  const summary = p.reviews_summary || { avg: 0, count: 0 };

  const submitReview = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post(`/shop/products/${id}/reviews`, { rating, comment });
      toast.success("Avaliação publicada");
      setComment(""); setRating(5); load();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setPosting(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10" data-testid="product-detail">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl border border-black/5 bg-brand-50">
            {gallery.length > 0
              ? <img src={gallery[activeImg]} alt={p.name} className="h-full w-full object-cover" data-testid="pdp-main-image" />
              : <div className="grid h-full place-items-center text-6xl">Wibaza</div>}
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-5 gap-2" data-testid="pdp-thumbs">
              {gallery.slice(0, 10).map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} data-testid={`pdp-thumb-${i}`}
                        className={`aspect-square overflow-hidden rounded-lg border-2 ${
                          activeImg === i ? "border-brand-500" : "border-transparent hover:border-black/20"
                        }`}>
                  <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{p.category || "Produto"}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">
            {p.seller_slug ? (
              <Link to={`/store/${p.seller_slug}`} className="inline-flex items-center gap-1 hover:text-brand-600" data-testid="pdp-seller-link">
                <Store className="h-4 w-4" /> Vendido por <strong className="text-ink-900">{p.seller_name}</strong>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1"><Store className="h-4 w-4" /> {p.seller_name}</span>
            )}
          </div>
          {summary.count > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Stars value={Math.round(summary.avg)} />
              <span className="text-sm text-ink-500">{summary.avg} · {summary.count} avaliações</span>
            </div>
          )}
          <p className="mt-6 font-display text-4xl font-extrabold text-brand-600">
            {money(p.price_cents, p.currency)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
            <Package className="h-4 w-4" /> {p.stock > 0 ? `${p.stock} em estoque` : "Fora de estoque"}
          </p>

          {p.description && (
            <div className="mt-6 rounded-xl bg-brand-50/60 p-4 text-sm leading-relaxed text-ink-700" data-testid="pdp-description">
              <p className="font-semibold text-ink-900">Descrição</p>
              <p className="mt-2 whitespace-pre-line">{p.description}</p>
            </div>
          )}

          {hasSizes && (
            <div className="mt-6" data-testid="pdp-sizes">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Tamanho</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} data-testid={`size-${s}`}
                          className={`min-w-11 rounded-full border px-4 py-1.5 text-sm font-medium ${
                            size === s ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white hover:border-brand-500"
                          }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasColors && (
            <div className="mt-6" data-testid="pdp-colors">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Cor</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} data-testid={`color-${c}`}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                            color === c ? "border-brand-500 bg-brand-500 text-white" : "border-black/10 bg-white hover:border-brand-500"
                          }`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center" data-testid="qty-minus">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold" data-testid="qty-value">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock || 99, qty + 1))} className="grid h-10 w-10 place-items-center" data-testid="qty-plus">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => doAdd(false)} disabled={p.stock === 0}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold hover:bg-black/5 disabled:opacity-50"
                    data-testid="add-to-cart">
              <ShoppingBag className="h-4 w-4" /> Adicionar
            </button>
            <button onClick={() => doAdd(true)} disabled={p.stock === 0}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
                    data-testid="buy-now">
              Comprar agora
            </button>
          </div>
          <button onClick={startChat} disabled={startingChat}
                  data-testid="chat-with-seller"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:border-brand-500 hover:text-brand-600">
            <MessageCircle className="h-4 w-4" />
            {startingChat ? "Abrindo…" : `Falar com ${p.seller_name}`}
          </button>
        </div>
      </div>
      {chatId && user && (
        <ChatDrawer threadId={chatId} currentUserId={user.id} onClose={() => setChatId(null)} />
      )}

      <section className="mt-16" data-testid="reviews">
        <h2 className="font-display text-2xl font-extrabold">Avaliações</h2>
        {canReview && !alreadyReviewed && (
          <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-black/5 bg-white p-6" data-testid="review-form">
            <p className="text-sm font-medium">Sua avaliação</p>
            <div className="mt-2"><Stars value={rating} size={6} onPick={setRating} /></div>
            <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)}
                      placeholder="Conte como foi sua experiência (opcional)"
                      className="mt-4 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-brand-500"
                      data-testid="review-comment" />
            <button type="submit" disabled={posting} data-testid="review-submit"
                    className="mt-3 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600">
              {posting ? "Enviando…" : "Publicar avaliação"}
            </button>
            <p className="mt-2 text-xs text-ink-500">
              Só é possível avaliar produtos após receber (pedido marcado como Entregue).
            </p>
          </form>
        )}
        <div className="mt-6 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-ink-500">Ainda sem avaliações — seja o primeiro.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/5 bg-white p-5" data-testid={`review-${r.id}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium">{r.buyer_name}</p>
                <Stars value={r.rating} />
              </div>
              {r.comment && <p className="mt-2 whitespace-pre-line text-sm text-ink-700">{r.comment}</p>}
              <p className="mt-2 text-xs text-ink-500">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
