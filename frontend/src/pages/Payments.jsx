import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, formatMoney, shortId, toCents } from "@/lib/format";

const METHODS = ["card", "pix", "boleto", "bank_transfer", "wallet"];

export default function Payments() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/payments");
  const [intentOpen, setIntentOpen] = useState(false);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [intent, setIntent] = useState({ amount: "100.00", currency: "BRL", description: "", capture_method: "automatic" });
  const [charge, setCharge] = useState({ payment_intent_id: "", type: "card", card_number: "4242424242424242", holder_name: "LEAMSE Test" });
  const [refund, setRefund] = useState({ charge_id: "", amount: "" });
  const money = (v, c) => formatMoney(v, c || "BRL", meta.intl);

  const createIntent = async () => {
    try {
      const { data: res } = await api.post("/dashboard/payments/intents", {
        amount: toCents(intent.amount, intent.currency),
        currency: intent.currency,
        description: intent.description,
        capture_method: intent.capture_method,
      }, { params: { project_id: projectId } });
      toast.success(`Intent ${shortId(res.id)} criada`);
      setIntentOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const createCharge = async () => {
    try {
      const { data: res } = await api.post("/dashboard/payments/charges", {
        payment_intent_id: charge.payment_intent_id,
        payment_method: { type: charge.type, card_number: charge.card_number, holder_name: charge.holder_name },
      }, { params: { project_id: projectId } });
      res.status === "failed" ? toast.error(`Recusada: ${res.failure_reason}`) : toast.success(`Cobrança ${res.status}`);
      setChargeOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const createRefund = async () => {
    try {
      await api.post("/dashboard/payments/refunds", {
        charge_id: refund.charge_id,
        amount: refund.amount ? toCents(refund.amount) : null,
        reason: "requested_by_customer",
      }, { params: { project_id: projectId } });
      toast.success("Reembolso criado");
      setRefundOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const settle = async () => {
    try {
      const { data: res } = await api.post("/dashboard/payments/settle", null, { params: { project_id: projectId, currency: "BRL" } });
      toast.success(`Liquidação: líquido ${money(res.net, res.currency)}`);
    } catch (e) { toast.error(errMsg(e)); }
  };

  const intentCols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "currency", label: t("common.currency") },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "capture_method", label: "Capture" },
    { key: "description", label: "Descrição" },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        ["requires_payment_method", "requires_confirmation", "requires_capture"].includes(r.status) ? (
          <Button size="sm" variant="outline" className="h-7 rounded-full text-xs"
                  data-testid="intent-charge-btn"
                  onClick={() => { setCharge((c) => ({ ...c, payment_intent_id: r.id })); setChargeOpen(true); }}>
            {t("pay.charge")}
          </Button>
        ) : <span className="text-xs text-muted-foreground">—</span>
      ) },
  ];

  const chargeCols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "fee", label: t("kpi.fees"), numeric: true, render: (r) => money(r.fee, r.currency), exportValue: (r) => r.fee },
    { key: "net", label: "Líquido", numeric: true, render: (r) => money(r.net, r.currency), exportValue: (r) => r.net },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "risk_score", label: "Risco", numeric: true },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        ["captured", "partially_refunded"].includes(r.status) && r.amount_captured > (r.amount_refunded || 0) ? (
          <Button size="sm" variant="outline" className="h-7 rounded-full text-xs"
                  data-testid="charge-refund-btn"
                  onClick={() => { setRefund({ charge_id: r.id, amount: "" }); setRefundOpen(true); }}>
            {t("pay.refund")}
          </Button>
        ) : <span className="text-xs text-muted-foreground">—</span>
      ) },
  ];

  const refundCols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "charge_id", label: "Charge", render: (r) => <span className="font-mono text-xs">{shortId(r.charge_id)}</span> },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "reason", label: "Motivo" },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="payments-header"
        title={t("nav.payments")}
        subtitle="Motor de pagamentos LEAMSE — intents, autorização, captura, split e reembolsos."
        actions={
          <>
            <Button data-testid="settle-btn" variant="outline" size="sm" className="rounded-full" onClick={settle}>
              {t("pay.settle")}
            </Button>
            <Dialog open={intentOpen} onOpenChange={setIntentOpen}>
              <DialogTrigger asChild>
                <Button data-testid="new-intent-btn" size="sm" className="rounded-full">{t("pay.newIntent")}</Button>
              </DialogTrigger>
              <DialogContent data-testid="intent-dialog">
                <DialogHeader><DialogTitle>{t("pay.newIntent")}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("common.amount")}</Label>
                    <Input data-testid="intent-amount" value={intent.amount}
                           onChange={(e) => setIntent({ ...intent, amount: e.target.value })} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("common.currency")}</Label>
                    <Select value={intent.currency} onValueChange={(v) => setIntent({ ...intent, currency: v })}>
                      <SelectTrigger data-testid="intent-currency" className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["BRL", "USD", "EUR", "GBP", "JPY", "MXN"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Captura</Label>
                    <Select value={intent.capture_method} onValueChange={(v) => setIntent({ ...intent, capture_method: v })}>
                      <SelectTrigger data-testid="intent-capture" className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="automatic">automatic</SelectItem>
                        <SelectItem value="manual">manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input data-testid="intent-description" value={intent.description}
                           onChange={(e) => setIntent({ ...intent, description: e.target.value })} className="rounded-xl" />
                  </div>
                </div>
                <DialogFooter>
                  <Button data-testid="intent-submit" className="rounded-full" onClick={createIntent}>{t("common.create")}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <Tabs defaultValue="intents">
        <TabsList data-testid="payments-tabs" className="rounded-full">
          <TabsTrigger value="intents" data-testid="tab-intents" className="rounded-full">{t("pay.intents")}</TabsTrigger>
          <TabsTrigger value="charges" data-testid="tab-charges" className="rounded-full">{t("pay.charges")}</TabsTrigger>
          <TabsTrigger value="refunds" data-testid="tab-refunds" className="rounded-full">{t("pay.refunds")}</TabsTrigger>
        </TabsList>
        <TabsContent value="intents" className="mt-6">
          <DataTable testId="intents-table" exportName="payment-intents" title={t("pay.intents")}
                     columns={intentCols} rows={data?.intents || []}
                     searchKeys={["id", "description", "status"]}
                     filters={[{ key: "status", label: t("common.status"), options: ["succeeded", "failed", "requires_capture", "requires_payment_method", "canceled"] }]}
                     searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
        </TabsContent>
        <TabsContent value="charges" className="mt-6">
          <DataTable testId="charges-table" exportName="charges" title={t("pay.charges")}
                     columns={chargeCols} rows={data?.charges || []} searchKeys={["id", "status"]}
                     filters={[{ key: "status", label: t("common.status"), options: ["captured", "authorized", "failed", "refunded", "partially_refunded"] }]}
                     searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
        </TabsContent>
        <TabsContent value="refunds" className="mt-6">
          <DataTable testId="refunds-table" exportName="refunds" title={t("pay.refunds")}
                     columns={refundCols} rows={data?.refunds || []} searchKeys={["id", "reason"]}
                     searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
        </TabsContent>
      </Tabs>

      <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
        <DialogContent data-testid="charge-dialog">
          <DialogHeader><DialogTitle>{t("pay.charge")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment intent</Label>
              <Input data-testid="charge-intent-id" value={charge.payment_intent_id}
                     onChange={(e) => setCharge({ ...charge, payment_intent_id: e.target.value })} className="rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Método</Label>
              <Select value={charge.type} onValueChange={(v) => setCharge({ ...charge, type: v })}>
                <SelectTrigger data-testid="charge-method" className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {charge.type === "card" && (
              <div className="space-y-2">
                <Label>Número do cartão (termina em 0002 = recusado)</Label>
                <Input data-testid="charge-card-number" value={charge.card_number}
                       onChange={(e) => setCharge({ ...charge, card_number: e.target.value })} className="rounded-xl font-mono" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button data-testid="charge-submit" className="rounded-full" onClick={createCharge}>{t("pay.charge")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent data-testid="refund-dialog">
          <DialogHeader><DialogTitle>{t("pay.refund")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Charge</Label>
              <Input data-testid="refund-charge-id" value={refund.charge_id}
                     onChange={(e) => setRefund({ ...refund, charge_id: e.target.value })} className="rounded-xl font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>{t("common.amount")} (vazio = total)</Label>
              <Input data-testid="refund-amount" value={refund.amount}
                     onChange={(e) => setRefund({ ...refund, amount: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="refund-submit" className="rounded-full" onClick={createRefund}>{t("pay.refund")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
