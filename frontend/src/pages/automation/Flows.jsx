import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";

const TRIGGERS = [
  { id: "appointment_created", label: "Novo agendamento" },
  { id: "lead_created", label: "Novo lead no CRM" },
  { id: "appointment_upcoming", label: "Agendamento próximo" },
  { id: "lead_won", label: "Lead ganho" },
];
const ACTIONS = [
  { id: "send_whatsapp", label: "Enviar WhatsApp" },
  { id: "send_reminder", label: "Enviar lembrete" },
  { id: "send_email", label: "Enviar e-mail" },
  { id: "move_stage", label: "Mover no funil" },
];

export default function Flows() {
  const { projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/automation/flows");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "appointment_created", action: "send_whatsapp" });
  const flows = data?.data || [];

  const create = async () => {
    if (!form.name) { toast.error("Dê um nome ao fluxo"); return; }
    try {
      await api.post("/dashboard/automation/flows", form, { params: { project_id: projectId } });
      toast.success("Fluxo criado");
      setOpen(false);
      setForm({ name: "", trigger: "appointment_created", action: "send_whatsapp" });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const toggle = async (f) => {
    try {
      await api.patch(`/dashboard/automation/flows/${f.id}`, { active: !f.active }, { params: { project_id: projectId } });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/dashboard/automation/flows/${id}`, { params: { project_id: projectId } });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const labelOf = (list, id) => list.find((x) => x.id === id)?.label || id;

  return (
    <div className="space-y-8">
      <PageHeader
        testId="flows-header"
        title="Automação"
        subtitle="Fluxos que trabalham para você enquanto você dorme."
        actions={<Button data-testid="new-flow-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>Novo fluxo</Button>}
      />

      <div data-testid="flows-list" className="grid gap-4 sm:grid-cols-2">
        {flows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum fluxo ainda</p>}
        {flows.map((f) => (
          <div key={f.id} data-testid={`flow-${f.id}`} className="ls-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-sm font-bold">{f.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quando <Badge variant="outline" className="rounded-full text-[10px]">{labelOf(TRIGGERS, f.trigger)}</Badge>
                  {" → "}
                  <Badge variant="outline" className="rounded-full text-[10px]">{labelOf(ACTIONS, f.action)}</Badge>
                </p>
              </div>
              <Switch data-testid={`flow-toggle-${f.id}`} checked={!!f.active} onCheckedChange={() => toggle(f)} />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{f.active ? "Ativo" : "Pausado"} · {f.runs || 0} execuções</span>
              <Button data-testid={`flow-delete-${f.id}`} size="icon" variant="ghost" className="h-7 w-7 rounded-full text-destructive" onClick={() => remove(f.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="flow-dialog">
          <DialogHeader><DialogTitle>Novo fluxo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input data-testid="flow-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Gatilho</Label>
              <Select value={form.trigger} onValueChange={(v) => setForm({ ...form, trigger: v })}>
                <SelectTrigger data-testid="flow-trigger" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{TRIGGERS.map((tr) => <SelectItem key={tr.id} value={tr.id}>{tr.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select value={form.action} onValueChange={(v) => setForm({ ...form, action: v })}>
                <SelectTrigger data-testid="flow-action" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{ACTIONS.map((ac) => <SelectItem key={ac.id} value={ac.id}>{ac.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="flow-submit" className="rounded-full" onClick={create}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
