import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { api, errMsg, money } from "@/lib/api";

/** Slide-in chat drawer. Poll-based (2s). Buyer opens from a product/store,
 *  seller opens from the inbox. */
export function ChatDrawer({ threadId, onClose, currentUserId }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const lastPolledAt = useRef(null);

  useEffect(() => {
    let alive = true;
    const bootstrap = async () => {
      try {
        const [t, m] = await Promise.all([
          api.get(`/mp/chat/threads/${threadId}`),
          api.get(`/mp/chat/threads/${threadId}/messages`),
        ]);
        if (!alive) return;
        setThread(t.data);
        setMessages(m.data);
        if (m.data.length) lastPolledAt.current = m.data[m.data.length - 1].created_at;
      } catch (e) { toast.error(errMsg(e)); onClose?.(); }
    };
    bootstrap();
    const iv = setInterval(async () => {
      if (!alive || !threadId) return;
      try {
        const params = lastPolledAt.current ? `?after=${encodeURIComponent(lastPolledAt.current)}` : "";
        const r = await api.get(`/mp/chat/threads/${threadId}/messages${params}`);
        if (r.data.length) {
          setMessages((prev) => [...prev, ...r.data]);
          lastPolledAt.current = r.data[r.data.length - 1].created_at;
        }
      } catch { /* silent */ }
    }, 2500);
    return () => { alive = false; clearInterval(iv); };
  }, [threadId, onClose]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await api.post(`/mp/chat/threads/${threadId}/messages`, { text: text.trim() });
      setMessages((prev) => [...prev, r.data]);
      lastPolledAt.current = r.data.created_at;
      setText("");
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50" data-testid="chat-drawer">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} data-testid="chat-backdrop" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <header className="flex items-center gap-3 border-b border-black/5 px-5 py-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-white">
            <MessageCircle className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {thread ? (currentUserId === thread.buyer_id ? thread.seller_name : thread.buyer_name) : "Carregando…"}
            </p>
            {thread?.product && (
              <p className="truncate text-xs text-ink-500">Sobre: {thread.product.name}</p>
            )}
          </div>
          <button onClick={onClose} data-testid="chat-close"
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </header>
        {thread?.product && (
          <div className="flex items-center gap-3 border-b border-black/5 bg-brand-50/40 px-5 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
              {thread.product.image_url && (
                <img src={thread.product.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{thread.product.name}</p>
              <p className="text-xs font-bold text-brand-600">
                {money(thread.product.price_cents, thread.product.currency)}
              </p>
            </div>
          </div>
        )}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" data-testid="chat-messages">
          {messages.length === 0 && (
            <p className="mt-8 text-center text-sm text-ink-500">
              Sem mensagens ainda. Diga oi, tire dúvidas ou combine detalhes.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  mine ? "rounded-br-md bg-brand-500 text-white" : "rounded-bl-md bg-black/5 text-ink-900"
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <p className={`mt-1 text-[10px] opacity-70`}>
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={send} className="border-t border-black/5 p-3">
          <div className="flex items-end gap-2">
            <textarea
              rows="1" value={text} onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(e); } }}
              placeholder="Escreva sua mensagem…"
              className="max-h-32 flex-1 resize-none rounded-2xl border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              data-testid="chat-input"
            />
            <button type="submit" disabled={sending || !text.trim()} data-testid="chat-send"
                    className="grid h-11 w-11 place-items-center rounded-full bg-brand-500 text-white disabled:opacity-50 hover:bg-brand-600">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
