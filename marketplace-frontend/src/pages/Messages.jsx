import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MessageCircle, ShoppingBag } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ChatDrawer } from "@/components/ChatDrawer";

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [active, setActive] = useState(null);
  const nav = useNavigate();

  const load = async () => {
    try { const r = await api.get("/mp/chat/threads"); setThreads(r.data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { if (user && typeof user === "object") load(); }, [user]);
  useEffect(() => { if (!active) load(); }, [active]);

  if (user === false) return <Navigate to="/login?next=/messages" replace />;
  if (user === null) return <div className="p-10 text-sm text-ink-500">Carregando…</div>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10" data-testid="messages-page">
      <h1 className="font-display text-2xl font-extrabold">Mensagens</h1>
      <p className="mt-1 text-sm text-ink-500">Converse com {user.user_type === "buyer" ? "vendedores" : "compradores"} das suas conversas.</p>
      <div className="mt-6 space-y-3">
        {threads.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">Nenhuma conversa ainda.</p>
            {user.user_type === "buyer" && (
              <button onClick={() => nav("/shop")} data-testid="messages-empty-cta"
                      className="mt-4 inline-flex items-center gap-1 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white">
                <ShoppingBag className="h-4 w-4" /> Explorar a loja
              </button>
            )}
          </div>
        )}
        {threads.map((t) => {
          const other = user.user_type === "buyer" ? t.seller_name : t.buyer_name;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} data-testid={`thread-${t.id}`}
                    className="flex w-full items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 text-left hover:border-brand-500">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-500 text-white font-bold">
                {other?.[0]?.toUpperCase() || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate font-medium">
                  {other}
                  {t.unread > 0 && (
                    <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-semibold text-white">
                      {t.unread}
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-ink-500">{t.last_message || "Sem mensagens ainda"}</p>
                {t.product && (
                  <p className="truncate text-xs text-ink-500">Sobre: {t.product.name}</p>
                )}
              </div>
              <p className="text-xs text-ink-500">
                {t.last_at && new Date(t.last_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </p>
            </button>
          );
        })}
      </div>
      {active && (
        <ChatDrawer threadId={active} currentUserId={user.id} onClose={() => setActive(null)} />
      )}
    </div>
  );
}
