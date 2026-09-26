import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";

export default function Marketplace() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/marketplace/overview");
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", code: "", value: "10", commission_bps: "1000" });

  const submit = async () => {
    try {
      const params = { params: { project_id: projectId } };
      if (dialog === "store") await api.post("/dashboard/marketplace/stores", { name: form.name, currency: "BRL", commission_bps: Number(form.commission_bps) }, params);
      if (dialog === "seller") await api.post("/dashboard/marketplace/sellers", { name: form.name, email: form.email, commission_bps: Number(form.commission_bps) }, params);
      if (dialog === "category") await api.post("/dashboard/marketplace/categories", { name: form.name, description: "" }, params);
      if (dialog === "coupon") await api.post("/dashboard/marketplace/coupons", { code: form.code, type: "percent", value: Number(form.value), max_redemptions: 100 }, params);
      toast.success("Criado com sucesso");
      setDialog(null);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const base = (extra = []) => [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "name", label: t("common.name") },
    ...extra,
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="marketplace-header"
        title={t("nav.marketplace")}
        subtitle="Lojas, vendedores, categorias e cupons com comissão e split automáticos."
        actions={
          <>
            <Button data-testid="new-store-btn" size="sm" className="rounded-full" onClick={() => setDialog("store")}>Nova loja</Button>
            <Button data-testid="new-seller-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("seller")}>Novo vendedor</Button>
            <Button data-testid="new-category-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("category")}>Nova categoria</Button>
            <Button data-testid="new-coupon-btn" size="sm" variant="outline" className="rounded-full" onClick={() => setDialog("coupon")}>Novo cupom</Button>
          </>
        }
      />

      <Tabs defaultValue="stores">
        <TabsList className="rounded-full" data-testid="marketplace-tabs">
          <TabsTrigger value="stores" data-testid="tab-stores" className="rounded-full">Lojas</TabsTrigger>
          <TabsTrigger value="sellers" data-testid="tab-mk-sellers" className="rounded-full">{t("nav.sellers")}</TabsTrigger>
          <TabsTrigger value="categories" data-testid="tab-categories" className="rounded-full">Categorias</TabsTrigger>
          <TabsTrigger value="coupons" data-testid="tab-coupons" className="rounded-full">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="mt-6">
          <DataTable testId="stores-table" exportName="stores" title="Lojas" rows={data?.stores || []}
                     searchKeys={["name", "slug"]} searchLabel={t("common.search")} emptyLabel={t("common.empty")}
                     columns={base([
                       { key: "slug", label: "Slug" },
                       { key: "currency", label: t("common.currency") },
                       { key: "commission_bps", label: "Comissão", numeric: true, render: (r) => `${(r.commission_bps / 100).toFixed(2)}%`, exportValue: (r) => r.commission_bps },
                       { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
                     ])} />
        </TabsContent>

        <TabsContent value="sellers" className="mt-6">
          <DataTable testId="mk-sellers-table" exportName="sellers" title={t("nav.sellers")} rows={data?.sellers || []}
                     searchKeys={["name", "email"]} searchLabel={t("common.search")} emptyLabel={t("common.empty")}
                     columns={base([
                       { key: "email", label: t("common.email") },
                       { key: "commission_bps", label: "Comissão", numeric: true, render: (r) => `${(r.commission_bps / 100).toFixed(2)}%`, exportValue: (r) => r.commission_bps },
                       { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
                     ])} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <DataTable testId="categories-table" exportName="categories" title="Categorias" rows={data?.categories || []}
                     searchKeys={["name"]} searchLabel={t("common.search")} emptyLabel={t("common.empty")}
                     columns={base([{ key: "slug", label: "Slug" }])} />
        </TabsContent>

        <TabsContent value="coupons" className="mt-6">
          <DataTable testId="coupons-table" exportName="coupons" title="Cupons" rows={data?.coupons || []}
                     searchKeys={["code"]} searchLabel={t("common.search")} emptyLabel={t("common.empty")}
                     columns={[
                       { key: "code", label: "Código", render: (r) => <span className="font-mono text-xs">{r.code}</span> },
                       { key: "type", label: "Tipo" },
                       { key: "value", label: "Valor", numeric: true, render: (r) => (r.type === "percent" ? `${r.value}%` : r.value) },
                       { key: "redemptions", label: "Usos", numeric: true, render: (r) => `${r.redemptions}/${r.max_redemptions}` },
                       { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
                     ]} />
        </TabsContent>
      </Tabs>

      <Dialog open={!!dialog} onOpenChange={(v) => !v && setDialog(null)}>
        <DialogContent data-testid="marketplace-dialog">
          <DialogHeader><DialogTitle className="capitalize">{dialog}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {dialog !== "coupon" && (
              <div className="space-y-2">
                <Label>{t("common.name")}</Label>
                <Input data-testid="mk-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
              </div>
            )}
            {dialog === "seller" && (
              <div className="space-y-2">
                <Label>{t("common.email")}</Label>
                <Input data-testid="mk-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
              </div>
            )}
            {(dialog === "seller" || dialog === "store") && (
              <div className="space-y-2">
                <Label>Comissão (bps — 1000 = 10%)</Label>
                <Input data-testid="mk-commission" value={form.commission_bps} onChange={(e) => setForm({ ...form, commission_bps: e.target.value })} className="rounded-xl" />
              </div>
            )}
            {dialog === "coupon" && (
              <>
                <div className="space-y-2">
                  <Label>Código</Label>
                  <Input data-testid="mk-coupon-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-xl font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>Desconto (%)</Label>
                  <Input data-testid="mk-coupon-value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-xl" />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button data-testid="mk-submit" className="rounded-full" onClick={submit}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
