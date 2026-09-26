import { Link } from "react-router-dom";
import { CalendarClock, KanbanSquare, Bot, Workflow, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { formatDate } from "@/lib/format";

const STAGE_LABELS = { lead: "Leads", qualified: "Qualificados", proposal: "Proposta", won: "Ganhos", lost: "Perdidos" };

export default function AutomationOverview() {
  const { meta } = useApp();
  const { data } = useProjectData("/dashboard/automation/overview");
  const pipeline = data?.pipeline || {};
  const stages = data?.stages || ["lead", "qualified", "proposal", "won", "lost"];
  const maxStage = Math.max(1, ...stages.map((s) => pipeline[s] || 0));

  return (
    <div className="space-y-8">
      <PageHeader
        testId="automation-overview-header"
        title="Automação"
        subtitle="Agenda, CRM, Assistente WhatsApp com IA e fluxos — tudo em um painel dedicado."
        actions={
          <Button asChild size="sm" className="rounded-full">
            <Link to="/app/automation/assistant" data-testid="go-assistant">Abrir Assistente</Link>
          </Button>
        }
      />

      <div data-testid="automation-kpis" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} testId="kpi-appointments" label="Agendamentos" value={data?.appointments_total ?? 0} icon={CalendarClock} hint={`${data?.appointments_upcoming ?? 0} próximos`} />
        <KpiCard index={1} testId="kpi-contacts" label="Contatos no CRM" value={data?.contacts_total ?? 0} icon={KanbanSquare} />
        <KpiCard index={2} testId="kpi-won" label="Valor ganho" value={`R$ ${Number(data?.won_value || 0).toLocaleString("pt-BR")}`} icon={TrendingUp} />
        <KpiCard index={3} testId="kpi-flows" label="Fluxos ativos" value={data?.flows_active ?? 0} icon={Workflow} hint={`${data?.flows_total ?? 0} no total`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <section data-testid="pipeline-card" className="ls-card p-6 lg:col-span-7">
          <h2 className="font-display text-base font-semibold md:text-lg">Funil do CRM</h2>
          <div className="mt-6 space-y-4">
            {stages.map((s) => (
              <div key={s} data-testid={`pipeline-${s}`}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{STAGE_LABELS[s] || s}</span>
                  <span className="ls-num text-muted-foreground">{pipeline[s] || 0}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((pipeline[s] || 0) / maxStage) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section data-testid="quick-cards" className="grid gap-4 lg:col-span-5">
          {[
            { to: "/app/automation/agenda", icon: CalendarClock, title: "Agenda", desc: "Agende com confirmação e lembretes automáticos." },
            { to: "/app/automation/crm", icon: KanbanSquare, title: "CRM", desc: "Pipeline visual com funil automático embutido." },
            { to: "/app/automation/assistant", icon: Bot, title: "Assistente WhatsApp", desc: "IA responde, agenda e qualifica leads 24/7." },
            { to: "/app/automation/flows", icon: Workflow, title: "Automação", desc: "Fluxos que trabalham enquanto você dorme." },
          ].map((c) => (
            <Link key={c.to} to={c.to} data-testid={`quick-${c.title}`} className="ls-card ls-lift flex items-start gap-3 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold">{c.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>

      <section data-testid="recent-appointments" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Próximos agendamentos</h2>
        <ul className="mt-5 space-y-3">
          {(data?.recent_appointments || []).length === 0 && <li className="text-sm text-muted-foreground">Nada por aqui ainda</li>}
          {(data?.recent_appointments || []).map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl ls-surface p-3.5">
              <div>
                <p className="text-sm font-medium">{a.customer_name} · {a.service_name || "—"}</p>
                <p className="text-xs text-muted-foreground">{a.scheduled_at}</p>
              </div>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs capitalize">{a.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
