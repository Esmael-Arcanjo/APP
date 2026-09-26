import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useCart } from "@/store/cart";

export function OrderSuccess() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const sid = params.get("session_id");
  const [state, setState] = useState("polling");
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    if (!sid) { setState("error"); return; }
    let tries = 0;
    let cancelled = false;
    const poll = async () => {
      tries += 1;
      try {
        const { data } = await api.get(`/shop/checkout/status/${sid}`);
        if (cancelled) return;
        if (data.payment_status === "paid") { clear(); setState("paid"); return; }
        if (tries >= 20) { setState("pending"); return; }
        setTimeout(poll, 1500);
      } catch {
        if (tries < 5) setTimeout(poll, 2000); else setState("error");
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sid, clear]);
  return (
    <div className="mx-auto max-w-md px-6 py-16" data-testid="order-success">
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        {state === "polling" && <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-500" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Confirmando pagamento…</h1>
        </>}
        {state === "paid" && <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Pedido confirmado!</h1>
          <p className="mt-2 text-sm text-ink-500">
            O vendedor já foi notificado e vai preparar seu envio.
          </p>
          <button onClick={() => nav("/orders")} className="mt-6 w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
            Ver meus pedidos
          </button>
        </>}
        {state === "pending" && <>
          <Loader2 className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Ainda processando</h1>
          <p className="mt-2 text-sm text-ink-500">Assim que o pagamento for aprovado o pedido aparecerá em seus pedidos.</p>
          <Link to="/orders" className="mt-6 inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
            Ir para meus pedidos
          </Link>
        </>}
        {state === "error" && <>
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">Não foi possível verificar</h1>
          <Link to="/orders" className="mt-6 inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 font-semibold text-white">Ver pedidos</Link>
        </>}
      </div>
    </div>
  );
}

export function OrderCancel() {
  return (
    <div className="mx-auto max-w-md px-6 py-16" data-testid="order-cancel">
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto h-12 w-12 text-ink-500" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Pagamento cancelado</h1>
        <p className="mt-2 text-sm text-ink-500">Seus itens continuam no carrinho — tente novamente quando quiser.</p>
        <Link to="/cart" className="mt-6 inline-flex w-full justify-center rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
          Voltar ao carrinho
        </Link>
      </div>
    </div>
  );
}
