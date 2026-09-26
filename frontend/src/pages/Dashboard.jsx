import { Link } from "react-router-dom";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ArrowUpRight, CreditCard, Mail, Percent, ShoppingBag, Wallet } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { formatMoney, formatDate } from "@/lib/format";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Dashboard() {
  const { t, meta, project } = useApp();
  const { data, loading } = useProjectData("/dashboard/analytics");
  const k = data?.kpis || {};
  const currency = data?.currency || "BRL";
  const money = (v) => formatMoney(v, currency, meta.intl);

  return (
    <div className="space-y-8">
      <PageHeader
        testId="dashboard-header"
        title={t("nav.dashboard")}
        subtitle={`${project?.name || "—"} · ${project?.mode || "test"} mode`}
        actions={
          <Button asChild size="sm" className="rounded-full">
            <Link to="/app/payments" data-testid="dashboard-new-payment">{t("pay.newIntent")}</Link>
          </Button>
        }
      />

      <div data-testid="kpi-grid" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} testId="kpi-gross-volume" label={t("kpi.grossVolume")} value={money(k.gross_volume)} icon={CreditCard} hint={`${k.transactions || 0} ${t("kpi.transactions").toLowerCase()}`} />
        <KpiCard index={1} testId="kpi-net-revenue" label={t("kpi.netRevenue")} value={money(k.net_revenue)} icon={ArrowUpRight} hint={`${t("kpi.fees")}: ${money(k.platform_fees)}`} />
        <KpiCard index={2} testId="kpi-approval" label={t("kpi.approval")} value={`${(k.approval_rate || 0).toFixed(1)}%`} icon={Percent} hint={`${t("kpi.refunded")}: ${money(k.refunded)}`} />
        <KpiCard index={3} testId="kpi-wallet" label={t("kpi.available")} value={money(k.wallet_available)} icon={Wallet} hint={`${t("kpi.reserved")}: ${money(k.wallet_reserved)}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section data-testid="volume-chart" className="ls-card p-6 lg:col-span-8">
          <h2 className="font-display text-base font-semibold md:text-lg">{t("dash.volumeOverTime")}</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeseries || []}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))"
                       tickFormatter={(v) => (v / 100).toFixed(0)} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                  formatter={(v) => money(v)}
                />
                <Area type="monotone" dataKey="volume" stroke="hsl(var(--chart-1))" strokeWidth={2.5} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section data-testid="methods-chart" className="ls-card p-6 lg:col-span-4">
          <h2 className="font-display text-base font-semibold md:text-lg">{t("dash.paymentMethods")}</h2>
          <div className="mt-6 h-72">
            {(data?.payment_methods?.length || 0) === 0 ? (
              <p className="pt-24 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.payment_methods} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>
                    {data.payment_methods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 }}
                    formatter={(v) => money(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section data-testid="secondary-kpis" className="grid gap-6 sm:grid-cols-2 lg:col-span-8">
          <KpiCard testId="kpi-orders" label={t("kpi.orders")} value={k.orders || 0} icon={ShoppingBag} hint={`${k.paid_orders || 0} paid`} />
          <KpiCard testId="kpi-customers" label={t("kpi.customers")} value={k.customers || 0} icon={ShoppingBag} hint={`${k.sellers || 0} ${t("kpi.sellers").toLowerCase()}`} />
          <KpiCard testId="kpi-emails" label={t("kpi.emails")} value={k.emails_sent || 0} icon={Mail} hint={`${k.emails || 0} total`} />
          <KpiCard testId="kpi-fees" label={t("kpi.fees")} value={money(k.platform_fees)} icon={Percent} />
        </section>

        <section data-testid="activity-feed" className="ls-card p-6 lg:col-span-4">
          <h2 className="font-display text-base font-semibold md:text-lg">{t("dash.activity")}</h2>
          <ul className="mt-5 space-y-3">
            {loading && <li className="text-sm text-muted-foreground">{t("common.loading")}</li>}
            {!loading && (data?.activity?.length || 0) === 0 && (
              <li className="text-sm text-muted-foreground">{t("common.empty")}</li>
            )}
            {(data?.activity || []).map((a, i) => (
              <li key={i} className="flex items-start justify-between gap-3 rounded-xl ls-surface p-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.created_at, meta.intl)}</p>
                </div>
                {a.amount != null && (
                  <span className="ls-num shrink-0 text-sm font-semibold">{formatMoney(a.amount, a.currency || currency, meta.intl)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
