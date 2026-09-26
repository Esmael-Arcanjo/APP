import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";

const STAGES = [
  { id: "lead", label: "Leads" },
  { id: "qualified", label: "Qualificados" },
  { id: "proposal", label: "Proposta" },
  { id: "won", label: "Ganhos" },
  { id: "lost", label: "Perdidos" },
];

export default function Crm() {
  const { projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/automation/contacts");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", stage: "lead", value: 0, notes: "" });
  const contacts = data?.data || [];

  const create = async () => {
    if (!form.name) { toast.error("Nome é obrigatório"); return; }
    try {
      await api.post("/dashboard/automation/contacts", { ...form, value: Number(form.value) || 0 }, { params: { project_id: projectId } });
      toast.success("Contato criado");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", stage: "lead", value: 0, notes: "" });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const move = async (contact, dir) => {
    const idx = STAGES.findIndex((s) => s.id === contact.stage);
    const next = STAGES[idx + dir];
    if (!next) return;
    try {
      await api.patch(`/dashboard/automation/contacts/${contact.id}`, { stage: next.id }, { params: { project_id: projectId } });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/dashboard/automation/contacts/${id}`, { params: { project_id: projectId } });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        testId="crm-header"
        title="CRM"
        subtitle="Pipeline visual com funil automático embutido. Nunca perca um cliente."
        actions={<Button data-testid="new-contact-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>Novo contato</Button>}
      />

      <div data-testid="crm-board" className="ls-scroll grid gap-4 overflow-x-auto lg:grid-cols-5">
        {STAGES.map((stage) => {
          const items = contacts.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} data-testid={`crm-kanban-column-${stage.id}`} className="min-w-[220px] rounded-2xl ls-surface p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-sm font-semibold">{stage.label}</span>
                <span className="ls-num rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((c) => (
                  <div key={c.id} data-testid={`crm-card-${c.id}`} className="rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold">{c.name}</p>
                    {c.email && <p className="truncate text-xs text-muted-foreground">{c.email}</p>}
                    {c.phone && <p className="truncate text-xs text-muted-foreground">{c.phone}</p>}
                    {c.value > 0 && <p className="ls-num mt-1 text-xs font-semibold text-primary">R$ {Number(c.value).toLocaleString("pt-BR")}</p>}
                    <div className="mt-2 flex items-center gap-1">
                      <Button data-testid={`crm-move-left-${c.id}`} size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => move(c, -1)}><ChevronLeft className="h-4 w-4" /></Button>
                      <Button data-testid={`crm-move-right-${c.id}`} size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => move(c, 1)}><ChevronRight className="h-4 w-4" /></Button>
                      <Button data-testid={`crm-delete-${c.id}`} size="icon" variant="ghost" className="ms-auto h-7 w-7 rounded-full text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="px-1 py-4 text-center text-xs text-muted-foreground">Vazio</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="contact-dialog">
          <DialogHeader><DialogTitle>Novo contato</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input data-testid="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input data-testid="contact-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input data-testid="contact-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor potencial (R$)</Label>
              <Input data-testid="contact-value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea data-testid="contact-notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="contact-submit" className="rounded-full" onClick={create}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
