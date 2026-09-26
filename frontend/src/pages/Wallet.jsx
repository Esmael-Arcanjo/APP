import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { KpiCard } from "@/components/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lock, Unlock, Wallet as WalletIcon, ArrowLeftRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, formatMoney, shortId, toCents } from "@/lib/format";

export default function Wallet() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/wallet");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ amount: "100.00", currency: "BRL", destination_id: "", description: "" });
  const money = (v, c) => formatMoney(v, c || "BRL", meta.intl);

  const primary = data?.balances?.[0] || {};

  const run = async () => {
    const body = { amount: toCents(form.amount, form.currency), currency: form.currency, description: form.description };
    try {
      if (dialog === "transfer") {
        await api.post("/dashboard/wallet/transfer", { ...body, destination_type: "seller", destination_id: form.destination_id },
          { params: { project_id: projectId } });
      } else {
        await api.post(`/dashboard/wallet/${dialog}`, body, { params: { project_id: projectId } });
      }
      toast.success("Operação concluída");
      setDialog(null);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const statementCols = [
    { key: "type", label: "Tipo" },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "balance_after", label: "Saldo após", numeric: true, render: (r) => money(r.balance_after, r.currency), exportValue: (r) => r.balance_after },
    { key: "description", label: "Descrição" },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  const transferCols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "destination_id", label: "Destino", render: (r) => <span className="font-mono text-xs">{shortId(r.destination_id)}</span> },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "status", label: t("common.status") },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="wallet-header"
        title={t("nav.wallet")}
        subtitle="Saldo disponível, reservas, transferências e extrato multi-moeda."
        actions={
          <>
            <Button data-testid="wallet-topup-btn" size="sm" className="rounded-full" onClick={() => setDialog("topup")}>
              {t("wallet.topup")}
            </Button>
            <Button data-testid="wallet-reserve-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("reserve")}>
              {t("wallet.reserve")}
            </Button>
            <Button data-testid="wallet-release-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("release")}>
              {t("wallet.release")}
            </Button>
            <Button data-testid="wallet-transfer-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("transfer")}>
              {t("wallet.transfer")}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard index={0} testId="wallet-available" label={t("kpi.available")} value={money(primary.available, primary.currency)} icon={WalletIcon} />
        <KpiCard index={1} testId="wallet-reserved" label={t("kpi.reserved")} value={money(primary.reserved, primary.currency)} icon={Lock} />
        <KpiCard index={2} testId="wallet-pending" label="Pendente" value={money(primary.pending, primary.currency)} icon={Unlock} />
      </div>

      {(data?.balances?.length || 0) > 1 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {data.balances.slice(1).map((b) => (
            <div key={b.id} className="ls-card ls-lift p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{b.currency}</p>
              <p className="ls-num mt-2 font-display text-xl font-bold">{money(b.available, b.currency)}</p>
            </div>
          ))}
        </div>
      )}

      <DataTable testId="statement-table" exportName="wallet-statement" title={t("wallet.statement")}
                 columns={statementCols} rows={data?.statement || []} searchKeys={["type", "description"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <DataTable testId="transfers-table" exportName="transfers" title={t("wallet.transfer")}
                 columns={transferCols} rows={data?.transfers || []} searchKeys={["id", "destination_id"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent data-testid="wallet-dialog">
          <DialogHeader>
            <DialogTitle className="capitalize">
              <ArrowLeftRight className="me-2 inline h-4 w-4" />{dialog}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.amount")}</Label>
              <Input data-testid="wallet-amount" value={form.amount}
                     onChange={(e) => setForm({ ...form, amount: e.target.value })} className="rounded-xl" />
            </div>
            {dialog === "transfer" && (
              <div className="space-y-2">
                <Label>Seller ID</Label>
                <Input data-testid="wallet-destination" value={form.destination_id}
                       onChange={(e) => setForm({ ...form, destination_id: e.target.value })} className="rounded-xl font-mono text-xs" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input data-testid="wallet-description" value={form.description}
                     onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="wallet-submit" className="rounded-full" onClick={run}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
