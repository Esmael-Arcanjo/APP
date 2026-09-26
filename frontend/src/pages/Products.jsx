import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, formatMoney, shortId, toCents } from "@/lib/format";

export default function Products() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/products", { limit: 200 });
  const { data: overview } = useProjectData("/dashboard/marketplace/overview");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: "99.90", stock: "10", seller_id: "", category_id: "", image_url: "" });
  const money = (v, c) => formatMoney(v, c || "BRL", meta.intl);

  const create = async () => {
    try {
      await api.post("/dashboard/products", {
        name: form.name, sku: form.sku, price: toCents(form.price), currency: "BRL",
        stock: Number(form.stock), seller_id: form.seller_id || null,
        category_id: form.category_id || null, image_url: form.image_url,
      }, { params: { project_id: projectId } });
      toast.success("Produto criado");
      setOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/dashboard/products/${id}`, { params: { project_id: projectId } });
      toast.success("Produto excluído");
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cols = [
    { key: "name", label: t("common.name") },
    { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: "price", label: "Preço", numeric: true, render: (r) => money(r.price, r.currency), exportValue: (r) => r.price },
    { key: "stock", label: "Estoque", numeric: true },
    { key: "seller_id", label: t("nav.sellers"), render: (r) => <span className="font-mono text-xs">{r.seller_id ? shortId(r.seller_id) : "—"}</span> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        <Button data-testid="product-delete-btn" size="sm" variant="outline"
                className="h-7 rounded-full text-xs text-destructive" onClick={() => remove(r.id)}>
          {t("common.delete")}
        </Button>
      ) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="products-header"
        title={t("nav.products")}
        subtitle="Catálogo, preços em centavos e estoque sincronizado com o inventário."
        actions={
          <Button data-testid="new-product-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
            {t("common.create")}
          </Button>
        }
      />

      <DataTable testId="products-table" exportName="products" title={t("nav.products")}
                 columns={cols} rows={data?.data || []} searchKeys={["name", "sku"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="product-dialog">
          <DialogHeader><DialogTitle>{t("nav.products")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input data-testid="product-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input data-testid="product-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="rounded-xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label>Preço</Label>
                <Input data-testid="product-price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input data-testid="product-stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>{t("nav.sellers")}</Label>
                <Select value={form.seller_id} onValueChange={(v) => setForm({ ...form, seller_id: v })}>
                  <SelectTrigger data-testid="product-seller" className="rounded-xl"><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {(overview?.sellers || []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="product-submit" className="rounded-full" onClick={create}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
