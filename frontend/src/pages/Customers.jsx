import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useApp } from "@/context/AppContext";
import { useProjectData } from "@/hooks/useProjectData";
import { api, errMsg } from "@/lib/api";
import { formatDate, shortId } from "@/lib/format";

export default function Customers() {
  const { t, meta, projectId } = useApp();
  const { data, reload } = useProjectData("/dashboard/customers", { limit: 200 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "BR" });

  const create = async () => {
    try {
      await api.post("/dashboard/customers", form, { params: { project_id: projectId } });
      toast.success("Cliente criado");
      setOpen(false);
      reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const cols = [
    { key: "id", label: t("common.id"), render: (r) => <span className="font-mono text-xs">{shortId(r.id)}</span> },
    { key: "name", label: t("common.name") },
    { key: "email", label: t("common.email") },
    { key: "phone", label: "Telefone" },
    { key: "country", label: "País" },
    { key: "created_at", label: t("common.date"), render: (r) => formatDate(r.created_at, meta.intl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        testId="customers-header"
        title={t("nav.customers")}
        subtitle="Base de clientes por projeto, isolada por tenant."
        actions={<Button data-testid="new-customer-btn" size="sm" className="rounded-full" onClick={() => setOpen(true)}>{t("common.create")}</Button>}
      />
      <DataTable testId="customers-table" exportName="customers" title={t("nav.customers")}
                 columns={cols} rows={data?.data || []} searchKeys={["name", "email"]}
                 searchLabel={t("common.search")} emptyLabel={t("common.empty")} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="customer-dialog">
          <DialogHeader><DialogTitle>{t("nav.customers")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("common.name")}</Label>
              <Input data-testid="customer-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>{t("common.email")}</Label>
              <Input data-testid="customer-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input data-testid="customer-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button data-testid="customer-submit" className="rounded-full" onClick={create}>{t("common.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
