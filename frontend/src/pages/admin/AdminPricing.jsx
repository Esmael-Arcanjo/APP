import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, errMsg } from "@/lib/api";
import { SERVICES, SELECTABLE_ORDER } from "@/config/services";

export default function AdminPricing() {
  const [pricing, setPricing] = useState({});
  const load = async () => {
    try { const { data } = await api.get("/admin/pricing"); setPricing(data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const save = async (service, entry) => {
    try { await api.patch("/admin/pricing", { service, ...entry }); toast.success("Preços atualizados"); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-6" data-testid="admin-pricing">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Preços</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajuste os planos mensal e anual de cada serviço (valores em centavos).</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SELECTABLE_ORDER.map((id) => (
          <PricingCard key={id} service={id} entry={pricing[id] || {}} onSave={save} />
        ))}
      </div>
    </div>
  );
}

function PricingCard({ service, entry, onSave }) {
  const [monthly, setMonthly] = useState(entry.monthly ?? 0);
  const [yearly, setYearly] = useState(entry.yearly ?? 0);
  useEffect(() => { setMonthly(entry.monthly ?? 0); setYearly(entry.yearly ?? 0); }, [entry.monthly, entry.yearly]);
  const isUsage = entry.model === "usage";
  const svc = SERVICES[service];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: svc.accent }}>
          <svc.icon className="h-4 w-4" />
        </span>
        <h3 className="font-display text-base font-bold">{svc.name}</h3>
      </div>
      {isUsage ? (
        <p className="mt-4 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
          Pay-as-you-go — sem plano fixo. Fee aplicada por transação.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <Label>Mensal ({entry.currency || "BRL"}) — centavos</Label>
            <Input type="number" value={monthly} onChange={(e) => setMonthly(+e.target.value)}
                   data-testid={`price-monthly-${service}`} />
          </div>
          <div className="space-y-1">
            <Label>Anual ({entry.currency || "BRL"}) — centavos</Label>
            <Input type="number" value={yearly} onChange={(e) => setYearly(+e.target.value)}
                   data-testid={`price-yearly-${service}`} />
          </div>
          <Button onClick={() => onSave(service, { monthly, yearly, currency: entry.currency })}
                  className="w-full rounded-full" data-testid={`save-${service}`}>
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
}
