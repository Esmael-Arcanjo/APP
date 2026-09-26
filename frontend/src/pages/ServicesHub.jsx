import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { enabledServices } from "@/config/services";

export default function ServicesHub() {
  const { services, organization } = useApp();
  const list = enabledServices(services);

  return (
    <div className="space-y-8">
      <PageHeader
        testId="services-hub-header"
        title={`Olá, ${organization?.name || "LEAMSE"}`}
        subtitle="Cada serviço tem seu próprio painel isolado. Escolha um serviço para começar."
      />

      <div data-testid="services-grid" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to={s.base}
              data-testid={`hub-card-${s.id}`}
              className="ls-card ls-lift group flex h-full flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: s.accent }}
                >
                  <s.icon className="h-6 w-6" />
                </span>
                {s.id === "linkbio" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" /> Sempre ativo
                  </span>
                ) : (
                  <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Produção
                  </span>
                )}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold">{s.name}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Abrir painel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
