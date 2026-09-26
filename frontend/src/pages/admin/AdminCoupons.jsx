import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Ticket, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { api, errMsg } from "@/lib/api";
import { SERVICES, SELECTABLE_ORDER } from "@/config/services";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", kind: "percent", value: 10, duration: "once",
    currency: "USD", duration_in_months: 3, max_redemptions: "", service: "any", min_interval: "any" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const { data } = await api.get("/admin/coupons"); setCoupons(data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase(),
        kind: form.kind,
        value: Number(form.value),
        duration: form.duration,
        service: form.service,
        min_interval: form.min_interval,
      };
      if (form.kind === "amount") payload.currency = form.currency;
      if (form.duration === "repeating") payload.duration_in_months = Number(form.duration_in_months);
      if (form.max_redemptions) payload.max_redemptions = Number(form.max_redemptions);
      await api.post("/admin/coupons", payload);
      toast.success("Cupom criado"); setForm({ ...form, code: "" }); load();
    } catch (e) { toast.error(errMsg(e)); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir cupom?")) return;
    try { await api.delete(`/admin/coupons/${id}`); toast.success("Excluído"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-coupons">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Cupons</h1>
        <p className="mt-1 text-sm text-muted-foreground">Códigos de desconto segmentados por serviço e intervalo.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <h3 className="font-display text-base font-bold">Novo cupom</h3>
          </div>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <Label>Código</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                     placeholder="WELCOME20" data-testid="coupon-code" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                  <SelectTrigger data-testid="coupon-kind"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentual (%)</SelectItem>
                    <SelectItem value="amount">Valor fixo (centavos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Valor</Label>
                <Input type="number" min="1" value={form.value}
                       onChange={(e) => setForm({ ...form, value: e.target.value })}
                       data-testid="coupon-value" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Duração</Label>
                <Select value={form.duration} onValueChange={(v) => setForm({ ...form, duration: v })}>
                  <SelectTrigger data-testid="coupon-duration"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Uma vez</SelectItem>
                    <SelectItem value="repeating">Meses</SelectItem>
                    <SelectItem value="forever">Sempre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Máx. usos</Label>
                <Input type="number" min="1" value={form.max_redemptions}
                       onChange={(e) => setForm({ ...form, max_redemptions: e.target.value })}
                       placeholder="ilimitado" data-testid="coupon-max" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Serviço</Label>
                <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                  <SelectTrigger data-testid="coupon-service"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Todos</SelectItem>
                    {SELECTABLE_ORDER.map((id) => (
                      <SelectItem key={id} value={id}>{SERVICES[id].name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Plano mínimo</Label>
                <Select value={form.min_interval} onValueChange={(v) => setForm({ ...form, min_interval: v })}>
                  <SelectTrigger data-testid="coupon-min-interval"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    <SelectItem value="yearly">Apenas anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={create} disabled={saving || !form.code}
                    className="w-full rounded-full" data-testid="coupon-create">
              {saving ? "Criando…" : "Criar cupom"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-6">
                  Nenhum cupom ainda.
                </TableCell></TableRow>
              ) : coupons.map((c) => (
                <TableRow key={c.id} data-testid={`coupon-row-${c.code}`}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell>
                    {c.kind === "percent" ? `${c.value}% off` : `${c.currency} ${(c.value/100).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.service && c.service !== "any" ? SERVICES[c.service]?.name || c.service : "todos"}
                    {c.min_interval === "yearly" && <> · <span className="text-primary">anual</span></>}
                  </TableCell>
                  <TableCell><Badge variant="outline">{c.duration}</Badge></TableCell>
                  <TableCell>
                    {c.redemptions || 0}{c.max_redemptions ? ` / ${c.max_redemptions}` : ""}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => remove(c.id)}
                            data-testid={`coupon-del-${c.code}`}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
