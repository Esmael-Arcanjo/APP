import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Users, CheckCircle2, Ban, Building2, ArrowRight, Ticket, Tag, LineChart } from "lucide-react";
import { api, errMsg } from "@/lib/api";

const KpiCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-2xl border border-border bg-card p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="mt-2 font-display text-3xl font-extrabold">{value ?? "—"}</p>
  </div>
);

const QuickLink = ({ to, label, icon: Icon, description, testId }) => (
  <Link to={to} data-testid={testId}
        className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <p className="font-display font-bold">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
  </Link>
);

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);
  return (
    <div className="space-y-8" data-testid="admin-overview">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Painel do Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Controle total da plataforma — usuários, planos, preços, cupons e métricas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Usuários" value={stats?.total_users} icon={Users} />
        <KpiCard label="Planos ativos" value={stats?.active_subscriptions} icon={CheckCircle2} />
        <KpiCard label="Banidos" value={stats?.banned_users} icon={Ban} />
        <KpiCard label="Organizações" value={stats?.total_organizations} icon={Building2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink to="/app/admin/users" label="Usuários" description="Banir, excluir e conceder plano grátis" icon={Users} testId="qk-users" />
        <QuickLink to="/app/admin/pricing" label="Preços" description="Ajustar mensal/anual por serviço" icon={Tag} testId="qk-pricing" />
        <QuickLink to="/app/admin/coupons" label="Cupons" description="Criar códigos de desconto segmentados" icon={Ticket} testId="qk-coupons" />
        <QuickLink to="/app/admin/metrics" label="Métricas" description="Trials, receita e conversão" icon={LineChart} testId="qk-metrics" />
      </div>
    </div>
  );
}
