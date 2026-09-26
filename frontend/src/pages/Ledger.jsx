import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { formatDate, formatMoney, shortId } from "@/lib/format";

export default function Ledger() {
  const { t, meta } = useApp();
  const { data } = useProjectData("/dashboard/ledger");
  const money = (v, c) => formatMoney(v, c || "BRL", meta.intl);

  const cols = [
    { key: "transaction_group", label: "Grupo", render: (r) => <span className="font-mono text-xs">{shortId(r.transaction_group)}</span> },
    { key: "account", label: "Conta", render: (r) => <span className="font-mono text-xs">{r.account}</span> },
    { key: "account_type", label: "Tipo" },
    { key: "direction", label: "Direção", render: (r) => (
        <Badge variant="outline" className={`rounded-full text-xs ${r.direction === "debit" ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
          {r.direction}
        </Badge>
      ) },
    { key: "amount", label: t("common.amount"), numeric: true, render: (r) => money(r.amount, r.currency), exportValue: (r) => r.amount },
    { key: "reference_type", label: "Referência" },
    { key: "description", label: "Descrição" },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  const balanceCols = [
    { key: "account", label: "Conta", render: (r) => <span className="font-mono text-xs">{r.account}</span> },
    { key: "debit", label: "Débito", numeric: true, render: (r) => money(r.debit, r.currency), exportValue: (r) => r.debit },
    { key: "credit", label: "Crédito", numeric: true, render: (r) => money(r.credit, r.currency), exportValue: (r) => r.credit },
    { key: "balance", label: "Saldo", numeric: true, render: (r) => money(r.balance, r.currency), exportValue: (r) => r.balance },
  ];

  const balances = (data?.trial_balance || []).map((b, i) => ({ ...b, id: `${b.account}-${i}` }));

  return (
    <div className="space-y-8">
      <PageHeader
        testId="ledger-header"
        title={t("nav.ledger")}
        subtitle="Livro razão imutável com dupla entrada. Correções apenas por reversão."
      />
      <DataTable testId="trial-balance-table" exportName="trial-balance" title="Balancete"
                 columns={balanceCols} rows={balances} searchKeys={["account"]} selectable={false}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
      <DataTable testId="ledger-table" exportName="ledger" title={t("nav.ledger")}
                 columns={cols} rows={data?.data || []} searchKeys={["account", "reference_type", "description"]}
                 filters={[{ key: "direction", label: "Direção", options: ["debit", "credit"] }]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
    </div>
  );
}
