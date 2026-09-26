import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ban, Trash2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { api, errMsg } from "@/lib/api";
import { SERVICES, SELECTABLE_ORDER } from "@/config/services";

const money = (c, cur) => new Intl.NumberFormat("pt-BR",
  { style: "currency", currency: cur || "BRL" }).format((c || 0) / 100);

function daysLeft(iso) {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const load = async () => {
    try { const { data } = await api.get("/admin/users"); setUsers(data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const ban = async (id, banned) => {
    try { await api.post(`/admin/users/${id}/${banned ? "unban" : "ban"}`); toast.success("Ok"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const del = async (id) => {
    if (!window.confirm("Excluir usuário e sua organização?")) return;
    try { await api.delete(`/admin/users/${id}`); toast.success("Excluído"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const grant = async (id, days, service) => {
    try { await api.post(`/admin/users/${id}/grant`, { days, service }); toast.success("Plano concedido"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">Banir, excluir ou conceder plano grátis para qualquer conta.</p>
      </div>
      <div className="rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Serviço</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Dias</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const svc = u.organization?.locked_service || (u.organization?.services || [])[0];
              const days = daysLeft(u.subscription?.current_period_end);
              return (
                <TableRow key={u.id} data-testid={`user-row-${u.id}`}>
                  <TableCell>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>{u.organization?.name || "—"}</TableCell>
                  <TableCell>{u.role === "admin" ? "—" : (svc ? SERVICES[svc]?.name || svc : "—")}</TableCell>
                  <TableCell>
                    {u.subscription
                      ? `${u.subscription.interval} · ${money(u.subscription.amount, u.subscription.currency)}`
                      : <Badge variant="outline">sem plano</Badge>}
                  </TableCell>
                  <TableCell>{days ?? "—"}</TableCell>
                  <TableCell>
                    {u.banned
                      ? <Badge variant="destructive">Banido</Badge>
                      : u.role === "admin"
                        ? <Badge className="bg-primary">Admin</Badge>
                        : <Badge variant="secondary">Ativo</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {u.role !== "admin" && (
                        <GrantDialog user={u} onGrant={grant} defaultService={svc || "email"} />
                      )}
                      {u.role !== "admin" && (
                        <Button size="icon" variant="ghost" onClick={() => ban(u.id, u.banned)}
                                data-testid={`ban-${u.id}`} title={u.banned ? "Desbanir" : "Banir"}>
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                      {u.role !== "admin" && (
                        <Button size="icon" variant="ghost" onClick={() => del(u.id)}
                                data-testid={`del-${u.id}`} title="Excluir">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GrantDialog({ user, onGrant, defaultService }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(30);
  const [service, setService] = useState(defaultService);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" data-testid={`grant-${user.id}`} title="Liberar plano grátis">
          <Gift className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liberar plano grátis</DialogTitle>
          <DialogDescription>Para {user.name} ({user.email})</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Dias</Label>
            <Input type="number" min="1" value={days} onChange={(e) => setDays(+e.target.value)} data-testid="grant-days" />
          </div>
          <div className="space-y-1">
            <Label>Serviço</Label>
            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={service} onChange={(e) => setService(e.target.value)} data-testid="grant-service">
              {SELECTABLE_ORDER.map((s) => <option key={s} value={s}>{SERVICES[s].name}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={async () => { await onGrant(user.id, days, service); setOpen(false); }}
                  data-testid="grant-confirm">Conceder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
