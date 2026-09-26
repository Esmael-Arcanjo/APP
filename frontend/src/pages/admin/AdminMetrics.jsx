import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { LineChart as LineIcon } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { SERVICES } from "@/config/services";

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    api.get("/admin/metrics/timeseries").then((r) => setMetrics(r.data))
      .catch((e) => toast.error(errMsg(e)));
  }, []);
  if (!metrics) return <p className="text-sm text-muted-foreground">Carregando métricas…</p>;
  const services = Object.entries(metrics.active_by_service || {});
  const conv = metrics.trial_conversion || {};
  return (
    <div className="space-y-6" data-testid="admin-metrics">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Métricas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Conversão de trials, receita mensal e planos ativos por serviço.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Trials totais" value={conv.total_trials || 0} />
        <Kpi label="Trials → pagos" value={conv.trials_paid || 0} />
        <Kpi label="Conversão" value={`${conv.pct || 0}%`} accent />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <LineIcon className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base font-bold">Receita mensal (últimos 12 meses)</h3>
        </div>
        <div className="mt-6 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.series || []}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={2.5} dot={{ r: 3 }} name="Receita" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-base font-bold">Novos planos por mês</h3>
        <div className="mt-6 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.series || []}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Bar dataKey="new_subscriptions" fill="#F97316" radius={[6,6,0,0]} name="Novos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-base font-bold">Planos ativos por serviço</h3>
        {services.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Nenhum plano ativo ainda.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {services.map(([svc, count]) => (
              <li key={svc} className="flex items-center justify-between py-3 text-sm">
                <span>{SERVICES[svc]?.name || svc}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-extrabold ${accent ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}
