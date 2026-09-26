import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";

const STATUS_ACTIONS = [
  { status: "confirmed", label: "Confirmar" },
  { status: "done", label: "Concluir" },
  { status: "cancelled", label: "Cancelar" },
];

export default function Agenda() {
  const { projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/automation/appointments");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ customer_name: "", contact: "", service_name: "", scheduled_at: "", notes: "" });

  const create = async () => {
    if (!form.customer_name || !form.scheduled_at) { toast.error("Nome e horário são obrigatórios"); return; }
    try {
      await api.post("/dashboard/automation/appointments", form, { params: { project_id: projectId } });
      toast.success("Agendamento criado");
      setOpen(false);
      setForm({ customer_name: "", contact: "", service_name: "", scheduled_at: "", notes: "" });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/dashboard/automation/appointments/${id}`, { status }, { params: { project_id: projectId } });
      toast.success("Atualizado");
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/dashboard/automation/appointments/${id}`, { params: { project_id: projectId } });
      toast.success("Excluído");
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cols = [
    { key: "customer_name", label: "Cliente" },
    { key: "service_name", label: "Serviço", render: (r) => r.service_name || "—" },
    { key: "contact", label: "Contato", render: (r) => r.contact || "—" },
    { key: "scheduled_at", label: "Horário", render: (r) => <span className="font-mono text-xs">{r.scheduled_at}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "actions", label: "Ações", render: (r) => (
        <div className="flex flex-wrap gap-1.5">
          {STATUS_ACTIONS.map((a) => (
            <Button key={a.status} data-testid={`appt-${a.status}-${r.id}`} size="sm" variant="outline"
                    className="h-7 rounded-full text-xs" onClick={() => setStatus(r.id, a.status)}>{a.label}</Button>
          ))}
          <Button data-testid={`appt-delete-${r.id}`} size="sm" variant="outline"
                  className="h-7 rounded-full text-xs text-destructive" onClick={() => remove(r.id)}>Excluir</Button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="agenda-header"
        title="Agenda"
        subtitle="Agendamentos com confirmação e lembretes automáticos."
        actions={<Button data-testid="new-appointment-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>Novo agendamento</Button>}
      />

      <DataTable testId="appointments-table" exportName="agenda" title="Agendamentos"
                 columns={cols} rows={data?.data || []} searchKeys={["customer_name", "service_name", "contact"]}
                 filters={[{ key: "status", label: "Status", options: ["scheduled", "confirmed", "done", "cancelled"] }]}
                 searchLabel="Buscar" emptyLabel="Nenhum agendamento ainda" />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="appointment-dialog">
          <DialogHeader><DialogTitle>Novo agendamento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input data-testid="appt-customer" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Contato (WhatsApp/e-mail)</Label>
                <Input data-testid="appt-contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Serviço</Label>
                <Input data-testid="appt-service" value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Data e hora</Label>
                <Input data-testid="appt-datetime" type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea data-testid="appt-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="appt-submit" className="rounded-full" onClick={create}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
