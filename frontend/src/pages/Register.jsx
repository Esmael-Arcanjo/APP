import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { api, errMsg } from "@/lib/api";
import { SERVICES, SELECTABLE_ORDER } from "@/config/services";

const money = (cents, currency) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" })
    .format((cents || 0) / 100);

function ServiceCard({ service, selected, onSelect, price }) {
  const s = SERVICES[service];
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      data-testid={`svc-choice-${service}`}
      aria-pressed={selected}
      className={`group relative flex h-full flex-col rounded-2xl border p-5 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10 ring-2 ring-primary"
          : "border-border hover:border-primary/40 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: s.accent }}
        >
          <s.icon className="h-5 w-5" />
        </span>
        {selected && <Check className="h-5 w-5 text-primary" />}
      </div>
      <h3 className="mt-4 font-display text-base font-bold">{s.name}</h3>
      <p className="mt-1 flex-1 text-xs text-muted-foreground">{s.description}</p>
      <div className="mt-4 rounded-lg bg-secondary/60 px-3 py-2 text-xs font-medium">
        {price || s.billingLabel}
      </div>
    </button>
  );
}

export default function Register() {
  const { register, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [pricing, setPricing] = useState({});
  const [geo, setGeo] = useState({ country: "BR", currency: "BRL" });
  const [service, setService] = useState(null);
  const [interval, setInterval] = useState("monthly");
  const [promo, setPromo] = useState("");
  const [promoValid, setPromoValid] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [loading, setLoading] = useState(false);

  const [checkoutMode, setCheckoutMode] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    api.get("/public/pricing").then((r) => setPricing(r.data)).catch(() => {});
    api.get("/public/geo").then((r) => setGeo(r.data)).catch(() => {});
  }, []);

  if (user && !checkoutMode) return <Navigate to="/app" replace />;

  const priceLabel = (id) => {
    const p = pricing[id];
    if (!p) return SERVICES[id].billingLabel;
    if (p.model === "usage") return "Pague conforme usar";
    const cur = p.currency || "USD";
    return `${money(p.monthly, cur)}/mês · ${money(p.yearly, cur)}/ano`;
  };

  const chosen = service ? pricing[service] : null;
  const chargeable = chosen?.model === "subscription";

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!service) { toast.error("Escolha um serviço"); return; }
    setLoading(true);
    try {
      if (chargeable) setCheckoutMode(true);
      await register({
        ...form,
        country: geo.country || "BR",
        currency: geo.currency || "BRL",
        service,
      });
      toast.success("Conta LEAMSE criada");
      if (chargeable) setStep(3); else navigate("/app");
    } catch (err) {
      setCheckoutMode(false);
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const goCheckout = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/billing/checkout", {
        service, interval, origin_url: window.location.origin,
        promo_code: promo || undefined,
      });
      if (data.checkout_url) window.location.href = data.checkout_url;
      else { toast.success(data.message || "Serviço ativo"); navigate("/app"); }
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const checkPromo = async () => {
    if (!promo) return;
    try {
      const { data } = await api.get(`/public/coupons/${promo.toUpperCase()}`);
      setPromoValid(data);
      toast.success(`Cupom ${data.code} aplicado`);
    } catch (e) {
      setPromoValid(null);
      toast.error(errMsg(e));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/"><Logo /></Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "font-semibold text-foreground" : ""}>1. Serviço</span>
            <span>›</span>
            <span className={step >= 2 ? "font-semibold text-foreground" : ""}>2. Conta</span>
            <span>›</span>
            <span className={step >= 3 ? "font-semibold text-foreground" : ""}>3. Pagamento</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Escolha seu serviço LEAMSE</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Cada conta usa <strong>um único serviço</strong>. A escolha é definitiva — não é possível trocar depois.
              Cada serviço tem seu próprio painel isolado.
            </p>

            <div data-testid="services-grid-signup" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SELECTABLE_ORDER.map((id) => (
                <ServiceCard
                  key={id}
                  service={id}
                  selected={service === id}
                  onSelect={setService}
                  price={priceLabel(id)}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between rounded-xl border border-dashed border-border p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                Escolha uma vez — não é possível alterar depois.
              </div>
              <Button
                data-testid="svc-continue"
                onClick={() => setStep(2)}
                disabled={!service}
                className="rounded-full"
              >
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.form
            onSubmit={submitRegister}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg space-y-5"
            data-testid="register-form"
          >
            <button
              type="button" onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Trocar serviço
            </button>
            <div>
              <h1 className="font-display text-3xl font-extrabold">Crie sua conta</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Serviço escolhido: <strong className="text-foreground">{SERVICES[service]?.name}</strong> ·{" "}
                <span className="text-primary">{priceLabel(service)}</span>
                <br />
                Moeda detectada automaticamente: <strong>{geo.currency || "BRL"}</strong> ({geo.country || "BR"})
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" data-testid="register-name" required value={form.name} onChange={set("name")} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Nome da empresa</Label>
                <Input id="company" data-testid="register-company" required value={form.company} onChange={set("company")} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" data-testid="register-email" type="email" required value={form.email} onChange={set("email")} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input id="password" data-testid="register-password"
                       type={showPass ? "text" : "password"} required minLength={6}
                       value={form.password} onChange={set("password")}
                       className="h-11 rounded-xl pr-11" />
                <button type="button" data-testid="register-toggle-pass"
                        onClick={() => setShowPass((v) => !v)}
                        aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button data-testid="register-submit" type="submit" disabled={loading} className="h-11 w-full rounded-full">
              {loading ? "Criando…" : chargeable ? "Ir para pagamento" : "Criar conta"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem conta? <Link to="/login" className="font-medium text-primary hover:underline">Entrar</Link>
            </p>
          </motion.form>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-lg space-y-6" data-testid="checkout-step">
            <h1 className="font-display text-3xl font-extrabold">Escolha o plano</h1>
            <p className="text-sm text-muted-foreground">
              Serviço: <strong>{SERVICES[service]?.name}</strong>
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {["monthly", "yearly"].map((k) => (
                <button
                  key={k}
                  type="button"
                  data-testid={`plan-${k}`}
                  onClick={() => setInterval(k)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    interval === k ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase text-muted-foreground">
                    {k === "monthly" ? "Mensal" : "Anual"}
                  </div>
                  <div className="mt-2 font-display text-2xl font-extrabold">
                    {money(chosen?.[k], chosen?.currency)}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {k === "yearly" ? "Melhor custo — 12 meses" : "Renovação mensal"}
                  </div>
                </button>
              ))}
            </div>
            <Button data-testid="go-checkout" onClick={goCheckout} disabled={loading} className="h-11 w-full rounded-full">
              {loading ? "Redirecionando…" : "Pagar com cartão · 7 dias grátis"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              O pagamento é obrigatório para acessar o serviço. Se cancelar, você poderá retomar
              pelo login.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
