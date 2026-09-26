import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, CreditCard, Link2, Mail, Store, Workflow, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { api } from "@/lib/api";
import { SERVICES, SELECTABLE_ORDER } from "@/config/services";

const PILLARS = [
  { icon: CreditCard, title: "LEAMSE Payments", desc: "Meio de pagamento próprio: intents, autorização, captura, split e reembolso — com carteira e ledger." },
  { icon: Store, title: "Marketplace API", desc: "Lojas, vendedores, produtos, pedidos e comissão automática com split entre sellers." },
  { icon: Mail, title: "Email API", desc: "Transacional: templates HTML, variáveis dinâmicas, histórico e estatísticas de entrega." },
  { icon: Workflow, title: "Automação", desc: "Agenda, CRM visual, Assistente WhatsApp com IA 24/7 e fluxos automáticos." },
  { icon: Link2, title: "Link na Bio", desc: "Uma página pública que apresenta seu negócio e vende — incluída em toda conta, sem API." },
  { icon: ShieldCheck, title: "Cada serviço, sua API", desc: "Painel isolado por serviço e chaves de produção dedicadas. Escopos, rotação e rate limit." },
];

const CODE = `curl -X POST https://api.leamse.com/v1/payment_intents \\
  -H "X-Api-Key: sk_live_..." \\
  -d amount=249900 \\
  -d currency=BRL \\
  -d "splits[0][destination]=seller_812" \\
  -d "splits[0][bps]=9000"`;

export default function Landing() {
  const [pricing, setPricing] = useState({});
  useEffect(() => { api.get("/public/pricing").then((r) => setPricing(r.data)).catch(() => {}); }, []);
  const money = (c, cur) => new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: cur || "USD" }).format((c || 0) / 100);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#services" data-testid="nav-services" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Serviços</a>
            <a href="#about" data-testid="nav-about" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Sobre Nós</a>
            <a href="#pricing" data-testid="nav-plans" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Planos</a>
            <a href="#contact" data-testid="nav-contact" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground">Contato</a>
          </nav>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/login" data-testid="landing-login-btn">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/register" data-testid="landing-register-btn">Criar conta</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden ls-grain">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 py-24 lg:grid-cols-12 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border ls-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              Financial &amp; Commerce Infrastructure · leamse.com
            </span>
            <h1 className="mt-8 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Pagamentos, comércio e automação em uma
              <span className="text-primary"> única infraestrutura</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              A LEAMSE é o próprio provedor de pagamentos, email e marketplace. Escolha os serviços que
              precisa — cada um com seu painel e sua API. Apenas produção, sem gateways externos.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/register" data-testid="hero-cta">
                  Criar conta grátis <ArrowRight className="ms-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href="/api/docs" data-testid="hero-docs">Ver documentação da API</a>
              </Button>
            </div>
            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-8">
              {[["5", "serviços"], ["25+", "moedas"], ["0", "gateways externos"]].map(([v, l]) => (
                <div key={l}>
                  <dt className="ls-num font-display text-2xl font-extrabold">{v}</dt>
                  <dd className="text-xs text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="ls-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border ls-surface px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--warning))]/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--success))]/60" />
                <span className="ms-2 text-xs text-muted-foreground">payment_intents.sh</span>
              </div>
              <pre className="ls-scroll overflow-x-auto p-5 font-mono text-xs leading-relaxed text-foreground/85">
                {CODE}
              </pre>
              <div className="border-t border-border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Resposta</p>
                <p className="ls-num mt-2 font-mono text-sm">
                  <span className="text-[hsl(var(--success))]">succeeded</span> · líquido R$ 2.421,71 · taxa R$ 72,77
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="border-t border-border ls-surface">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="max-w-xl font-display text-base font-semibold text-muted-foreground md:text-lg">
            Um ecossistema modular. Cada serviço com seu próprio painel.
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, desc }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className="ls-card ls-lift bg-card p-8"
              >
                <span className="inline-flex rounded-xl bg-accent p-2.5 text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              </motion.article>
            ))}
          </div>
          <div className="mt-12">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/register" data-testid="pillars-cta">Escolher meus serviços <ArrowRight className="ms-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
              Sobre nós
            </span>
            <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
              Uma infraestrutura financeira e de comércio, feita para desenvolvedores.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              A LEAMSE nasceu para simplificar como negócios recebem, enviam, se comunicam e crescem
              online. Somos o próprio provedor de pagamentos, de Email API e de Marketplace API —
              não intermediamos ninguém.
            </p>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              Um único ecossistema, cinco serviços independentes, cada um com seu painel isolado.
              Você escolhe apenas o que precisa e paga apenas por ele.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Requisições/mês", value: "120M+" },
              { label: "Uptime SLA", value: "99.99%" },
              { label: "Países", value: "38" },
              { label: "Latência p95", value: "≤ 120ms" },
            ].map((s) => (
              <div key={s.label} className="ls-card bg-background p-6">
                <p className="text-xs uppercase text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-border" data-testid="pricing-section">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border ls-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              Preços transparentes
            </span>
            <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
              Um único serviço por conta. Sem surpresa na fatura.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              Pay-as-you-go em Payments e Marketplace. Planos mensais/anuais com <strong>7 dias grátis</strong>
              em Email, Automação e Link na Bio.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SELECTABLE_ORDER.map((id, i) => {
              const s = SERVICES[id]; const p = pricing[id] || {};
              const isUsage = p.model === "usage";
              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                  data-testid={`pricing-card-${id}`}
                  className="ls-card ls-lift bg-card p-6 flex flex-col"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: s.accent }}>
                      <s.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-display text-lg font-bold">{s.name}</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{s.description}</p>
                  <div className="my-6 border-t border-border" />
                  {isUsage ? (
                    <>
                      <p className="font-display text-3xl font-extrabold">Pay-as-you-go</p>
                      <p className="mt-1 text-xs text-muted-foreground">Fee aplicada por transação · sem plano fixo</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="font-display text-3xl font-extrabold">{money(p.monthly, p.currency)}</p>
                        <span className="text-sm text-muted-foreground">/mês</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        ou <strong>{money(p.yearly, p.currency)}</strong>/ano
                      </p>
                      <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> 7 dias grátis</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Cancele quando quiser</li>
                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5" /> Cupom aceito no checkout</li>
                      </ul>
                    </>
                  )}
                  <div className="mt-auto pt-6">
                    <Button asChild className="w-full rounded-full">
                      <Link to="/register" data-testid={`pricing-cta-${id}`}>
                        Começar com {s.name}
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-border ls-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              Contato
            </span>
            <h2 className="mt-6 font-display text-3xl font-extrabold sm:text-4xl">
              Fale com a gente
            </h2>
            <p className="mt-4 text-sm text-muted-foreground md:text-base">
              Precisa de ajuda para escolher o serviço certo, tirar dúvidas de integração ou
              conversar sobre volumes maiores? Nossa equipe responde em até 1 dia útil.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Comercial", value: "vendas@leamse.com" },
              { label: "Suporte técnico", value: "suporte@leamse.com" },
              { label: "Imprensa", value: "press@leamse.com" },
            ].map((c) => (
              <div key={c.label} className="ls-card flex items-center justify-between bg-card p-5">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">{c.label}</p>
                  <p className="mt-1 font-medium">{c.value}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={`mailto:${c.value}`}>Enviar email</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size={26} />
          <p className="text-xs text-muted-foreground">© 2026 LEAMSE · leamse.com</p>
        </div>
      </footer>
    </div>
  );
}
