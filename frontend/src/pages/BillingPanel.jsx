import { useEffect, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, CreditCard, Repeat, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { api, errMsg } from "@/lib/api";
import { SERVICES } from "@/config/services";

const money = (c, cur) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur || "BRL" }).format((c || 0) / 100);

function daysLeft(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function BillingPanel() {
  const [data, setData] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [r, o] = await Promise.all([api.get("/billing/subscription"), api.get("/organization")]);
      setData(r.data); setOrg(o.data);
    } catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const sub = data?.subscription;
  const service = sub?.service || org?.locked_service || (org?.services || [])[0];
  const entry = service ? data?.pricing?.[service] : null;
  const isUsage = entry?.model === "usage";
  const days = daysLeft(sub?.current_period_end);

  const change = async (interval) => {
    setLoading(true);
    try {
      await api.post("/billing/subscription/change-interval", { interval });
      toast.success(`Plano alterado para ${interval === "monthly" ? "mensal" : "anual"}`);
      await load();
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };

  const cancel = async () => {
    setLoading(true);
    try {
      await api.post("/billing/subscription/cancel");
      toast.success("Assinatura cancelada — permanecerá ativa até o fim do período");
      await load();
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };

  const startCheckout = async (interval) => {
    setLoading(true);
    try {
      const { data: r } = await api.post("/billing/checkout", {
        service, interval, origin_url: window.location.origin, trial: true,
      });
      if (r.checkout_url) window.location.href = r.checkout_url;
      else { toast.success(r.message || "Ativo"); await load(); }
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  };

  if (!data) return <div className="text-sm text-muted-foreground">Carregando…</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6" data-testid="billing-panel">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Seu plano</p>
            <h2 className="mt-1 font-display text-2xl font-extrabold">
              {service ? SERVICES[service]?.name || service : "Sem serviço"}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {sub?.status === "active" && <Badge className="bg-emerald-500">Ativo</Badge>}
              {sub?.status === "canceled" && <Badge variant="destructive">Cancelado</Badge>}
              {sub?.trial && <Badge className="bg-primary">Trial</Badge>}
              {sub?.granted_by_admin && <Badge className="bg-amber-500">Cortesia admin</Badge>}
              {isUsage && <Badge variant="outline">Pay-as-you-go</Badge>}
              {sub?.interval && !isUsage && (
                <span className="inline-flex items-center gap-1"><Repeat className="h-3.5 w-3.5" />
                  {sub.interval === "yearly" ? "Anual" : sub.interval === "monthly" ? "Mensal" : sub.interval}
                </span>
              )}
              {days !== null && sub?.status !== "canceled" && (
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {days} dias restantes
                </span>
              )}
            </div>
          </div>
          {!isUsage && sub?.amount ? (
            <div className="text-right">
              <p className="font-display text-3xl font-extrabold">
                {money(sub.amount, sub.currency)}
              </p>
              <p className="text-xs text-muted-foreground">/{sub.interval === "yearly" ? "ano" : "mês"}</p>
            </div>
          ) : null}
        </div>

        {!isUsage && sub && sub.status !== "canceled" && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              data-testid="switch-monthly"
              variant={sub.interval === "monthly" ? "default" : "outline"}
              disabled={loading || sub.interval === "monthly"}
              onClick={() => change("monthly")}
              className="rounded-full"
            >Mudar para mensal</Button>
            <Button
              data-testid="switch-yearly"
              variant={sub.interval === "yearly" ? "default" : "outline"}
              disabled={loading || sub.interval === "yearly"}
              onClick={() => change("yearly")}
              className="rounded-full"
            >Mudar para anual</Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" className="rounded-full text-red-500 hover:text-red-600"
                        data-testid="cancel-subscription">
                  <XCircle className="mr-1 h-4 w-4" /> Cancelar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancelar assinatura?</DialogTitle>
                  <DialogDescription>
                    Você continuará com acesso até o fim do período atual. Sem cobranças futuras.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="destructive" onClick={cancel} data-testid="cancel-confirm">
                    Confirmar cancelamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {(!sub || sub.status === "canceled") && entry?.model === "subscription" && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {["monthly", "yearly"].map((k) => (
              <button
                key={k}
                data-testid={`resubscribe-${k}`}
                disabled={loading}
                onClick={() => startCheckout(k)}
                className="rounded-2xl border border-border p-5 text-left transition hover:border-primary/50"
              >
                <div className="text-xs uppercase text-muted-foreground">{k === "monthly" ? "Mensal" : "Anual"}</div>
                <div className="mt-2 font-display text-2xl font-extrabold">
                  {money(entry[k], entry.currency)}
                </div>
                <div className="mt-1 text-xs text-primary">Inclui 7 dias grátis</div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="font-display text-base font-bold">Histórico de faturas</h3>
        {data.invoices?.length ? (
          <ul className="mt-4 divide-y divide-border">
            {data.invoices.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>{new Date(i.period_end || i.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
                <span className="font-semibold">{money(i.amount, i.currency)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma fatura ainda.</p>
        )}
      </div>
    </motion.div>
  );
}
