import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MailCheck, MailX } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function Emails() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/emails", { limit: 200 });
  const [sendOpen, setSendOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [send, setSend] = useState({ to: "delivered@resend.dev", template: "welcome", variables: '{"name":"Maria"}' });
  const [tpl, setTpl] = useState({ slug: "", name: "", subject: "", html: "" });

  const doSend = async () => {
    let variables = {};
    try { variables = JSON.parse(send.variables || "{}"); }
    catch { toast.error("Variáveis devem ser JSON válido"); return; }
    try {
      const { data: res } = await api.post("/dashboard/emails/send",
        { to: send.to, template: send.template, variables },
        { params: { project_id: projectId } });
      res.status === "sent" ? toast.success("E-mail enviado") : toast.error(`Falha: ${res.error}`);
      setSendOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const createTpl = async () => {
    try {
      await api.post("/dashboard/emails/templates", { ...tpl, text: "", variables: [] }, { params: { project_id: projectId } });
      toast.success("Template criado");
      setTplOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const resend = async (id) => {
    try {
      await api.post(`/dashboard/emails/logs/${id}/resend`, null, { params: { project_id: projectId } });
      toast.success("Reenviado");
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const stats = data?.stats || {};

  const logCols = [
    { key: "to", label: "Para" },
    { key: "subject", label: "Assunto" },
    { key: "template_slug", label: "Template", render: (r) => <span className="font-mono text-xs">{r.template_slug}</span> },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "error", label: "Erro", render: (r) => <span className="text-xs text-muted-foreground">{r.error || "—"}</span> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        <Button data-testid="email-resend-btn" size="sm" variant="outline" className="h-7 rounded-full text-xs" onClick={() => resend(r.id)}>
          {t("email.resend")}
        </Button>
      ) },
  ];

  const tplCols = [
    { key: "slug", label: "Slug", render: (r) => <span className="font-mono text-xs">{r.slug}</span> },
    { key: "name", label: t("common.name") },
    { key: "subject", label: "Assunto" },
    { key: "variables", label: "Variáveis", render: (r) => (r.variables || []).join(", ") || "—" },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="emails-header"
        title={t("nav.emails")}
        subtitle="Email API transacional: templates, variáveis dinâmicas, histórico e reenvio."
        actions={
          <>
            <Button data-testid="send-email-btn" size="sm" className="rounded-full" onClick={() => setSendOpen(true)}>{t("email.send")}</Button>
            <Button data-testid="new-template-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setTplOpen(true)}>{t("email.templates")}</Button>
          </>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} testId="email-total" label="Total" value={stats.total || 0} icon={Mail} />
        <KpiCard index={1} testId="email-sent" label="Enviados" value={stats.sent || 0} icon={MailCheck} />
        <KpiCard index={2} testId="email-failed" label="Falhas" value={stats.failed || 0} icon={MailX} />
        <KpiCard index={3} testId="email-rate" label={t("email.deliveryRate")} value={`${(stats.delivery_rate || 0).toFixed(1)}%`} icon={MailCheck} />
      </div>

      <Tabs defaultValue="logs">
        <TabsList className="rounded-full" data-testid="emails-tabs">
          <TabsTrigger value="logs" data-testid="tab-logs" className="rounded-full">{t("email.logs")}</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates" className="rounded-full">{t("email.templates")}</TabsTrigger>
        </TabsList>
        <TabsContent value="logs" className="mt-6">
          <DataTable testId="email-logs-table" exportName="email-logs" title={t("email.logs")}
                     columns={logCols} rows={data?.logs || []} searchKeys={["to", "subject", "template_slug"]}
                     filters={[{ key: "status", label: t("common.status"), options: ["sent", "failed", "queued"] }]}
                     searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
        </TabsContent>
        <TabsContent value="templates" className="mt-6">
          <DataTable testId="email-templates-table" exportName="email-templates" title={t("email.templates")}
                     columns={tplCols} rows={data?.templates || []} searchKeys={["slug", "name"]}
                     searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
        </TabsContent>
      </Tabs>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent data-testid="send-email-dialog">
          <DialogHeader><DialogTitle>{t("email.send")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Para</Label>
              <Input data-testid="email-to" type="email" value={send.to} onChange={(e) => setSend({ ...send, to: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={send.template} onValueChange={(v) => setSend({ ...send, template: v })}>
                <SelectTrigger data-testid="email-template" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(data?.templates || []).map((tp) => <SelectItem key={tp.slug} value={tp.slug}>{tp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Variáveis (JSON)</Label>
              <Textarea data-testid="email-variables" rows={3} value={send.variables}
                        onChange={(e) => setSend({ ...send, variables: e.target.value })} className="rounded-xl font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="email-send-submit" className="rounded-full" onClick={doSend}>{t("email.send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent data-testid="template-dialog">
          <DialogHeader><DialogTitle>{t("email.templates")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input data-testid="template-slug" value={tpl.slug} onChange={(e) => setTpl({ ...tpl, slug: e.target.value })} className="rounded-xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label>{t("common.name")}</Label>
                <Input data-testid="template-name" value={tpl.name} onChange={(e) => setTpl({ ...tpl, name: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assunto (use {"{{variavel}}"})</Label>
              <Input data-testid="template-subject" value={tpl.subject} onChange={(e) => setTpl({ ...tpl, subject: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>HTML</Label>
              <Textarea data-testid="template-html" rows={6} value={tpl.html}
                        onChange={(e) => setTpl({ ...tpl, html: e.target.value })} className="rounded-xl font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="template-submit" className="rounded-full" onClick={createTpl}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
