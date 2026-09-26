import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { api, errMsg } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

const PLAN_FEATURES = {
  free: ["Sandbox completo", "Marketplace API", "Email limitado", "Chaves de teste"],
  business: ["Produção", "Payments + Wallet", "Marketplace + Email", "Analytics + Webhooks"],
  enterprise: ["White label", "SLA dedicado", "Limites personalizados", "Multi organizações"],
};

export default function Billing() {
  const { t, meta, organization, loadWorkspace } = useApp();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const res = await api.get("/dashboard/subscription");
    setData(res.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (fn) => {
    try { await fn(); toast.success("Assinatura atualizada"); await load(); await loadWorkspace(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const sub = data?.subscription;
  const pricing = data?.pricing || {};
  const money = (v) => formatMoney(v, sub?.currency || "BRL", meta.intl);

  const cols = [
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => formatMoney(r.amount, r.currency, meta.intl), exportValue: (r) => r.amount },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "period_end", label: "Vencimento", render: (r) => formatDate(r.period_end, meta.intl) },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="billing-header"
        title={t("nav.billing")}
        subtitle="A própria LEAMSE usa o módulo de assinaturas para cobrar seus clientes."
        actions={
          sub && sub.status !== "canceled" ? (
            <>
              <Button data-testid="renew-btn" size="sm" variant="outline" className="rounded-full"
                      onClick={() => act(() => api.post("/dashboard/subscription/renew"))}>Renovar</Button>
              <Button data-testid="cancel-sub-btn" size="sm" variant="outline" className="rounded-full text-destructive"
                      onClick={() => act(() => api.post("/dashboard/subscription/cancel"))}>Cancelar</Button>
            </>
          ) : null
        }
      />

      <section data-testid="current-plan" className="ls-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("billing.plan")}</p>
            <p className="mt-1 font-display text-2xl font-extrabold uppercase">{organization?.plan || "free"}</p>
          </div>
          {sub && <StatusBadge status={sub.status} testId="sub-status" />}
          {sub && <p className="ls-num text-sm text-muted-foreground">{money(sub.amount)} / {sub.interval}</p>}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {["free", "business", "enterprise"].map((plan) => (
          <div key={plan} className={`ls-card ls-lift p-8 ${organization?.plan === plan ? "border-primary/50 ring-1 ring-primary/25" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{plan}</p>
            <p className="ls-num mt-4 font-display text-3xl font-extrabold">
              {formatMoney(pricing[plan]?.monthly || 0, "BRL", meta.intl)}
              <span className="text-sm font-medium text-muted-foreground"> /mês</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
              {PLAN_FEATURES[plan].map((f) => <li key={f}>· {f}</li>)}
            </ul>
            {organization?.plan === plan ? (
              <Badge variant="outline" className="mt-8 w-full justify-center rounded-full py-2">Plano atual</Badge>
            ) : (
              <Button
                data-testid={`subscribe-${plan}`}
                className="mt-8 w-full rounded-full"
                variant={plan === "business" ? "default" : "outline"}
                onClick={() => act(() => api.post("/dashboard/subscription", { plan, interval: "monthly", currency: "BRL" }))}
              >
                {t("billing.subscribe")}
              </Button>
            )}
          </div>
        ))}
      </div>

      <DataTable testId="invoices-table" exportName="invoices" title={t("billing.invoices")}
                 columns={cols} rows={data?.invoices || []} selectable={false} searchKeys={["status"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
    </div>
  );
}
