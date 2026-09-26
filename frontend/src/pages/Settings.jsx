import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/context/AppContext";
import { api, errMsg } from "@/lib/api";
import { LANGUAGES } from "@/lib/i18n";
import { SERVICES, enabledServices } from "@/config/services";
import BillingPanel from "@/pages/BillingPanel";

const CURRENCIES = ["BRL", "USD", "EUR", "GBP", "JPY", "MXN", "INR", "AED", "CNY"];

export default function Settings() {
  const { t, user, organization, services, loadWorkspace, locale, setLocale, theme, setTheme } = useApp();
  const [orgForm, setOrgForm] = useState({
    name: organization?.name || "",
    default_currency: organization?.default_currency || "BRL",
  });
  const enabled = enabledServices(services);

  const saveOrg = async () => {
    try {
      await api.patch("/organization", orgForm);
      toast.success("Organização atualizada");
      loadWorkspace();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        testId="settings-header"
        title={t("nav.settings")}
        subtitle="Organização, serviços ativos e preferências de interface."
      />

      <section data-testid="profile-card" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">{t("common.profile")}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Nome</p>
            <p className="mt-1 text-sm font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">E-mail</p>
            <p className="mt-1 text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Papel</p>
            <Badge variant="outline" className="mt-1 rounded-full">{user?.role}</Badge>
          </div>
        </div>
      </section>

      <section data-testid="org-card" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Organização</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input data-testid="org-name" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Moeda padrão</Label>
            <Select value={orgForm.default_currency} onValueChange={(v) => setOrgForm({ ...orgForm, default_currency: v })}>
              <SelectTrigger data-testid="org-currency" className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <Button data-testid="org-save" className="mt-5 rounded-full" onClick={saveOrg}>Salvar</Button>
      </section>

      <section data-testid="services-card" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Serviços ativos</h2>
        <p className="mt-2 text-sm text-muted-foreground">Cada serviço possui seu próprio painel isolado. Apenas modo de produção.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {enabled.map((s) => (
            <Link key={s.id} to={s.base} data-testid={`settings-service-${s.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ backgroundColor: s.accent }}>
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">{s.noApi ? "Sem API · sempre ativo" : "Com API dedicada"}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section data-testid="billing-section" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Plano e cobrança</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie sua assinatura: veja o plano ativo, troque entre mensal e anual ou cancele quando quiser.
        </p>
        <div className="mt-5">
          <BillingPanel />
        </div>
      </section>

      <section data-testid="preferences-card" className="ls-card p-6">
        <h2 className="font-display text-base font-semibold md:text-lg">Preferências</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <Select value={locale} onValueChange={setLocale}>
              <SelectTrigger data-testid="pref-language" className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>{LANGUAGES.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger data-testid="pref-theme" className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </div>
  );
}
