import {
  CreditCard, Wallet, Landmark, Webhook, KeyRound,
  Store, ShoppingBag, Boxes, Users, Receipt,
  Mail, MailPlus,
  CalendarClock, KanbanSquare, Bot, Workflow, LayoutGrid,
  Link2,
} from "lucide-react";

// Each service is fully isolated: it owns its dashboard and its own navigation.
export const SERVICES = {
  payments: {
    id: "payments",
    name: "LEAMSE Payments",
    module: "payments",
    accent: "#F97316",
    icon: CreditCard,
    description: "Meio de pagamento próprio: cobranças, carteira e ledger contábil.",
    base: "/app/payments",
    billing: "usage",
    billingLabel: "Pague conforme usar",
    apiExample: "/api/v1/payment_intents",
    nav: [
      { key: "pay-overview", label: "Visão geral", to: "/app/payments", icon: CreditCard, end: true },
      { key: "pay-wallet", label: "Carteira", to: "/app/payments/wallet", icon: Wallet },
      { key: "pay-ledger", label: "Livro razão", to: "/app/payments/ledger", icon: Landmark },
      { key: "pay-webhooks", label: "Webhooks", to: "/app/payments/webhooks", icon: Webhook },
      { key: "pay-api", label: "API & Chaves", to: "/app/payments/api", icon: KeyRound },
    ],
  },
  marketplace: {
    id: "marketplace",
    name: "Marketplace API",
    module: "marketplace",
    accent: "#F59E0B",
    icon: Store,
    description: "Pedidos, produtos, vendedores e split automático entre sellers.",
    base: "/app/marketplace",
    billing: "usage",
    billingLabel: "Pague conforme usar",
    apiExample: "/api/v1/products",
    nav: [
      { key: "mk-overview", label: "Visão geral", to: "/app/marketplace", icon: Store, end: true },
      { key: "mk-orders", label: "Pedidos", to: "/app/marketplace/orders", icon: ShoppingBag },
      { key: "mk-products", label: "Produtos", to: "/app/marketplace/products", icon: Boxes },
      { key: "mk-customers", label: "Clientes", to: "/app/marketplace/customers", icon: Users },
      { key: "mk-sellers", label: "Vendedores", to: "/app/marketplace/sellers", icon: Receipt },
      { key: "mk-api", label: "API & Chaves", to: "/app/marketplace/api", icon: KeyRound },
    ],
  },
  email: {
    id: "email",
    name: "Email API",
    module: "email",
    accent: "#EF4444",
    icon: Mail,
    description: "Envio transacional com templates, variáveis e logs de entrega.",
    base: "/app/email",
    billing: "subscription",
    billingLabel: "25/mês · 250/ano",
    apiExample: "/api/v1/emails/send",
    nav: [
      { key: "em-overview", label: "Envios & Templates", to: "/app/email", icon: MailPlus, end: true },
      { key: "em-api", label: "API & Chaves", to: "/app/email/api", icon: KeyRound },
    ],
  },
  automation: {
    id: "automation",
    name: "Automação",
    module: "automation",
    accent: "#EA580C",
    icon: Workflow,
    description: "Agenda, CRM visual, Assistente WhatsApp com IA e fluxos automáticos.",
    base: "/app/automation",
    billing: "subscription",
    billingLabel: "R$ 30/mês · R$ 350/ano",
    // Automação NÃO expõe API/chaves.
    nav: [
      { key: "au-overview", label: "Visão geral", to: "/app/automation", icon: LayoutGrid, end: true },
      { key: "au-agenda", label: "Agenda", to: "/app/automation/agenda", icon: CalendarClock },
      { key: "au-crm", label: "CRM", to: "/app/automation/crm", icon: KanbanSquare },
      { key: "au-assistant", label: "Assistente WhatsApp", to: "/app/automation/assistant", icon: Bot },
      { key: "au-flows", label: "Automação", to: "/app/automation/flows", icon: Workflow },
    ],
  },
  linkbio: {
    id: "linkbio",
    name: "Link na Bio",
    module: "linkbio",
    accent: "#18181B",
    icon: Link2,
    noApi: true,
    description: "Sua página pública que apresenta o negócio e vende para você.",
    base: "/app/linkbio",
    billing: "subscription",
    billingLabel: "R$ 5/mês · R$ 50/ano",
    // Link na Bio NÃO expõe API/chaves.
    nav: [
      { key: "lb-overview", label: "Editor da página", to: "/app/linkbio", icon: Link2, end: true },
    ],
  },
};

// Every service is selectable at signup (one at a time, locked forever).
export const SELECTABLE_ORDER = ["payments", "marketplace", "email", "automation", "linkbio"];

export function serviceFromPath(pathname) {
  const seg = (pathname || "").split("/")[2];
  return SERVICES[seg] ? seg : null;
}

export function enabledServices(orgServices = []) {
  const set = new Set(orgServices);
  return SELECTABLE_ORDER.filter((s) => set.has(s)).map((id) => SERVICES[id]);
}
