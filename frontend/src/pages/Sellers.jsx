import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { formatDate, shortId } from "@/lib/format";

export default function Sellers() {
  const { t, meta } = useApp();
  const { data } = useProjectData("/dashboard/sellers", { limit: 200 });

  const cols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "name", label: t("common.name") },
    { key: "email", label: t("common.email") },
    { key: "commission_bps", label: "Comissão", numeric: true, render: (r) => `${(r.commission_bps / 100).toFixed(2)}%`, exportValue: (r) => r.commission_bps },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="sellers-header"
        title={t("nav.sellers")}
        subtitle="Vendedores com comissão configurável e payout automático via wallet."
      />
      <DataTable testId="sellers-table" exportName="sellers" title={t("nav.sellers")}
                 columns={cols} rows={data?.data || []} searchKeys={["name", "email"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />
    </div>
  );
}
