import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";

export default function Webhooks() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/webhooks");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ url: "https://example.com/leamse-webhook", events: [] });

  const create = async () => {
    try {
      await api.post("/dashboard/webhooks", {
        url: form.url,
        events: form.events.length ? form.events : data?.events || [],
        description: "",
      }, { params: { project_id: projectId } });
      toast.success("Webhook criado");
      setOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const toggle = async (hook) => {
    try {
      await api.patch(`/dashboard/webhooks/${hook.id}`, { enabled: !hook.enabled }, { params: { project_id: projectId } });
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/dashboard/webhooks/${id}`, { params: { project_id: projectId } });
      toast.success("Removido");
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cols = [
    { key: "url", label: t("hook.endpoint"), render: (r) => <span className="font-mono text-xs">{r.url}</span> },
    { key: "events", label: t("hook.events"), render: (r) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {(r.events || []).slice(0, 2).map((e) => <Badge key={e} variant="outline" className="rounded-full text-[10px]">{e}</Badge>)}
          {(r.events || []).length > 2 && <Badge variant="outline" className="rounded-full text-[10px]">+{r.events.length - 2}</Badge>}
        </div>
      ), exportValue: (r) => (r.events || []).join(" ") },
    { key: "secret", label: "Secret (HMAC)", render: (r) => <span className="font-mono text-xs">{String(r.secret).slice(0, 16)}…</span> },
    { key: "enabled", label: "Ativo", render: (r) => (
        <Switch data-testid="webhook-toggle" checked={!!r.enabled} onCheckedChange={() => toggle(r)} />
      ) },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        <Button data-testid="webhook-delete-btn" size="sm" variant="outline"
                className="h-7 rounded-full text-xs text-destructive" onClick={() => remove(r.id)}>
          {t("common.delete")}
        </Button>
      ) },
  ];

  const deliveryCols = [
    { key: "event", label: "Evento", render: (r) => <span className="font-mono text-xs">{r.event}</span> },
    { key: "url", label: "URL", render: (r) => <span className="font-mono text-xs">{r.url}</span> },
    { key: "status_code", label: "HTTP", numeric: true, render: (r) => r.status_code ?? "—" },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="webhooks-header"
        title={t("nav.webhooks")}
        subtitle="Assinatura HMAC, retry automático e histórico completo de entregas."
        actions={<Button data-testid="new-webhook-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>{t("common.create")}</Button>}
      />

      <DataTable testId="webhooks-table" exportName="webhooks" title={t("nav.webhooks")}
                 columns={cols} rows={data?.data || []} searchKeys={["url"]} selectable={false}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <DataTable testId="deliveries-table" exportName="webhook-deliveries" title={t("hook.deliveries")}
                 columns={deliveryCols} rows={data?.deliveries || []} searchKeys={["event", "url"]} selectable={false}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="webhook-dialog">
          <DialogHeader><DialogTitle>{t("nav.webhooks")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("hook.endpoint")}</Label>
              <Input data-testid="webhook-url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>{t("hook.events")}</Label>
              <div className="flex flex-wrap gap-2">
                {(data?.events || []).map((ev) => {
                  const active = form.events.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      data-testid={`event-${ev}`}
                      onClick={() => setForm((f) => ({
                        ...f,
                        events: active ? f.events.filter((x) => x !== ev) : [...f.events, ev],
                      }))}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {ev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="webhook-submit" className="rounded-full" onClick={create}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
