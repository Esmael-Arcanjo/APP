import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { api, errMsg } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SERVICES } from "@/config/services";

export default function ApiKeys({ service }) {
  const { meta, projectId } = useApp();
  const svc = SERVICES[service] || SERVICES.payments;
  const [keys, setKeys] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${svc.name} key`);
  const [created, setCreated] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    const { data } = await api.get(`/projects/${projectId}/api-keys`);
    setKeys(data.filter((k) => (k.service || null) === service));
  }, [projectId, service]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      const { data } = await api.post(`/projects/${projectId}/api-keys`, { name, service });
      setCreated(data);
      setOpen(false);
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const act = async (id, action) => {
    try {
      const { data } = await api.post(`/api-keys/${id}/${action}`);
      if (action === "rotate") setCreated(data);
      toast.success(action === "rotate" ? "Chave rotacionada" : "Chave revogada");
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    if (!window.confirm("Apagar essa chave em definitivo? Ela não poderá ser recuperada.")) return;
    try {
      await api.delete(`/api-keys/${id}`);
      toast.success("Chave apagada");
      load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const copy = (value) => { navigator.clipboard?.writeText(value); toast.success("Copiado"); };

  const cols = [
    { key: "name", label: "Nome" },
    { key: "publishable_key", label: "Chave publicável", render: (r) => (
        <button data-testid="copy-publishable" onClick={() => copy(r.publishable_key)} className="font-mono text-xs hover:text-primary">
          {r.publishable_key} <Copy className="inline h-3 w-3" />
        </button>
      ) },
    { key: "secret_preview", label: "Chave secreta", render: (r) => <span className="font-mono text-xs">{r.secret_preview}</span> },
    { key: "scopes", label: "Escopos", render: (r) => (
        <div className="flex max-w-xs flex-wrap gap-1">
          {(r.scopes || []).map((s) => <Badge key={s} variant="outline" className="rounded-full text-[10px]">{s}</Badge>)}
        </div>
      ), exportValue: (r) => (r.scopes || []).join(" ") },
    { key: "revoked", label: "Status", render: (r) => (
        <Badge variant="outline" className={`rounded-full text-xs ${r.revoked ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
          {r.revoked ? "revogada" : "ativa"}
        </Badge>
      ) },
    { key: "created_at", label: "Data", render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: "Ações", render: (r) => (
        <div className="flex gap-2">
          <Button data-testid="rotate-key-btn" size="sm" variant="outline" className="h-7 rounded-full text-xs" onClick={() => act(r.id, "rotate")}>Rotacionar</Button>
          {!r.revoked && (
            <Button data-testid="revoke-key-btn" size="sm" variant="outline" className="h-7 rounded-full text-xs text-destructive" onClick={() => act(r.id, "revoke")}>Revogar</Button>
          )}
          <Button data-testid="delete-key-btn" size="sm" variant="outline" className="h-7 rounded-full text-xs text-destructive" onClick={() => remove(r.id)}>Apagar</Button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="api-keys-header"
        title={`API — ${svc.name}`}
        subtitle="Chaves de produção exclusivas deste serviço. Cada serviço tem sua própria API."
        actions={<Button data-testid="new-key-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>Nova chave</Button>}
      />

      <DataTable testId="api-keys-table" exportName="api-keys" title="Chaves de API"
                 columns={cols} rows={keys} searchKeys={["name", "publishable_key"]} selectable={false}
                 searchLabel="Buscar" emptyLabel="Nenhuma chave ainda" />

      <section className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Exemplo de uso</h2>
        <pre className="ls-scroll mt-4 overflow-x-auto rounded-xl ls-surface p-4 font-mono text-xs leading-relaxed">
{`curl -X POST ${process.env.REACT_APP_BACKEND_URL}${svc.apiExample} \\
  -H "X-Api-Key: sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{}'`}
        </pre>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="key-dialog">
          <DialogHeader><DialogTitle>Nova chave — {svc.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input data-testid="key-name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </div>
          <DialogFooter>
            <Button data-testid="key-submit" className="rounded-full" onClick={create}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!created} onOpenChange={(v) => !v && setCreated(null)}>
        <DialogContent data-testid="key-created-dialog">
          <DialogHeader><DialogTitle><KeyRound className="me-2 inline h-4 w-4" />Chave secreta</DialogTitle></DialogHeader>
          <p className="text-sm text-destructive">Copie sua chave secreta agora — ela é exibida apenas uma vez.</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Chave publicável</p>
              <p data-testid="created-publishable" className="mt-1 break-all rounded-xl ls-surface p-3 font-mono text-xs">{created?.publishable_key}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Chave secreta</p>
              <p data-testid="created-secret" className="mt-1 break-all rounded-xl ls-surface p-3 font-mono text-xs">{created?.secret_key}</p>
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="copy-secret-btn" className="rounded-full" onClick={() => copy(created?.secret_key)}>
              <Copy className="me-2 h-4 w-4" /> Copiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
