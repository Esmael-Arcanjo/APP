import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, formatMoney, shortId } from "@/lib/format";

export default function Orders() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/orders", { limit: 200 });
  const { data: products } = useProjectData("/dashboard/products", { limit: 200 });
  const { data: customers } = useProjectData("/dashboard/customers", { limit: 200 });
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(null);
  const [form, setForm] = useState({ product_id: "", quantity: "1", customer_id: "", coupon_code: "" });
  const money = (v, c) => formatMoney(v, c || "BRL", meta.intl);

  const create = async () => {
    try {
      await api.post("/dashboard/orders", {
        customer_id: form.customer_id || null,
        items: [{ product_id: form.product_id, quantity: Number(form.quantity) }],
        coupon_code: form.coupon_code || null,
        currency: "BRL",
      }, { params: { project_id: projectId } });
      toast.success("Pedido criado");
      setOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const pay = async () => {
    try {
      const { data: res } = await api.post(`/dashboard/orders/${checkout}/checkout`, {
        payment_method: { type: "card", card_number: "4242424242424242", holder_name: "LEAMSE Test" },
      }, { params: { project_id: projectId } });
      res.charge?.status === "captured" ? toast.success("Pedido pago com split aplicado") : toast.error("Pagamento recusado");
      setCheckout(null);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "items", label: "Itens", numeric: true, render: (r) => r.items?.length || 0, exportValue: (r) => r.items?.length || 0 },
    { key: "subtotal", label: "Subtotal", numeric: true, render: (r) => money(r.subtotal, r.currency), exportValue: (r) => r.subtotal },
    { key: "discount", label: "Desconto", numeric: true, render: (r) => money(r.discount, r.currency), exportValue: (r) => r.discount },
    { key: "total", label: t("common.total"), numeric: true, render: (r) => money(r.total, r.currency), exportValue: (r) => r.total },
    { key: "status", label: t("common.status"), render: (r) => <StatusBadge status={r.status} /> },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
    { key: "actions", label: t("common.actions"), render: (r) => (
        r.status === "pending" ? (
          <Button data-testid="order-pay-btn" size="sm" className="h-7 rounded-full text-xs" onClick={() => setCheckout(r.id)}>
            Pagar
          </Button>
        ) : <span className="text-xs text-muted-foreground">—</span>
      ) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="orders-header"
        title={t("nav.orders")}
        subtitle="Pedidos com cupons, comissão por vendedor e checkout via LEAMSE Payments."
        actions={
          <Button data-testid="new-order-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
            {t("common.create")}
          </Button>
        }
      />

      <DataTable testId="orders-table" exportName="orders" title={t("nav.orders")}
                 columns={cols} rows={data?.data || []} searchKeys={["id", "status"]}
                 filters={[{ key: "status", label: t("common.status"), options: ["pending", "paid", "shipped", "delivered", "canceled", "refunded"] }]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="order-dialog">
          <DialogHeader><DialogTitle>{t("nav.orders")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("nav.products")}</Label>
              <Select value={form.product_id} onValueChange={(v) => setForm({ ...form, product_id: v })}>
                <SelectTrigger data-testid="order-product" className="rounded-xl"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {(products?.data || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} · {money(p.price, p.currency)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input data-testid="order-quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{t("nav.customers")}</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger data-testid="order-customer" className="rounded-xl"><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {(customers?.data || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cupom</Label>
              <Input data-testid="order-coupon" value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} className="rounded-xl font-mono" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="order-submit" className="rounded-full" onClick={create}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!checkout} onOpenChange={(v) => !v && setCheckout(null)}>
        <DialogContent data-testid="checkout-dialog">
          <DialogHeader><DialogTitle>Checkout LEAMSE</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            O pedido será cobrado pelo motor LEAMSE Payments com split automático entre vendedores.
          </p>
          <DialogFooter>
            <Button data-testid="checkout-submit" className="rounded-full" onClick={pay}>Confirmar pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
