import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { formatMoney } from "@/lib/format";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Analytics() {
  const { t, meta } = useApp();
  const { data } = useProjectData("/dashboard/analytics", { days: 30 });
  const k = data?.kpis || {};
  const currency = data?.currency || "BRL";
  const money = (v) => formatMoney(v, currency, meta.intl);
  const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12 };

  return (
    <div className="space-y-8">
      <PageHeader
        testId="analytics-header"
        title={t("nav.analytics")}
        subtitle="Receita, volume, aprovação, reembolsos, split, clientes, vendedores e e-mails."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} testId="an-volume" label={t("kpi.grossVolume")} value={money(k.gross_volume)} />
        <KpiCard index={1} testId="an-net" label={t("kpi.netRevenue")} value={money(k.net_revenue)} />
        <KpiCard index={2} testId="an-refunds" label={t("kpi.refunded")} value={money(k.refunded)} />
        <KpiCard index={3} testId="an-approval" label={t("kpi.approval")} value={`${(k.approval_rate || 0).toFixed(1)}%`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section data-testid="an-volume-chart" className="ls-card p-6 lg:col-span-7">
          <h2 className="font-display text-base font-semibold md:text-lg">{t("dash.volumeOverTime")}</h2>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeseries || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => (v / 100).toFixed(0)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                <Line type="monotone" dataKey="volume" stroke="hsl(var(--chart-1))" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="fees" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section data-testid="an-methods-chart" className="ls-card p-6 lg:col-span-5">
          <h2 className="font-display text-base font-semibold md:text-lg">{t("dash.paymentMethods")}</h2>
          <div className="mt-6 h-72">
            {(data?.payment_methods?.length || 0) === 0 ? (
              <p className="pt-24 text-center text-sm text-muted-foreground">{t("common.empty")}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.payment_methods} dataKey="value" nameKey="name" outerRadius={95}>
                    {data.payment_methods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(v)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section data-testid="an-entities-chart" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Crescimento do ecossistema</h2>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: t("kpi.orders"), value: k.orders || 0 },
                { name: t("kpi.customers"), value: k.customers || 0 },
                { name: t("kpi.sellers"), value: k.sellers || 0 },
                { name: t("nav.products"), value: k.products || 0 },
                { name: t("kpi.emails"), value: k.emails_sent || 0 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
