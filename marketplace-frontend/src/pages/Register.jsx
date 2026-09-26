import { Link, Navigate } from "react-router-dom";
import { ShoppingBag, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/** Landing page for account creation. The user chooses between
 *  a buyer account (comprar) and a seller account (vender). */
export default function Register() {
  const { user } = useAuth();
  if (user && typeof user === "object") return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-4xl px-6 py-16" data-testid="register-picker">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Como você quer usar o Wibaza?</h1>
        <p className="mt-3 text-sm text-ink-500">Escolha o tipo de conta — dá para ter uma de cada com e-mails diferentes.</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Link to="/register/buyer" data-testid="pick-buyer"
              className="group relative flex flex-col rounded-3xl border border-black/10 bg-white p-8 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <h2 className="mt-6 font-display text-2xl font-extrabold">Sou comprador</h2>
          <p className="mt-2 text-sm text-ink-500">Descobrir lojas, comprar produtos e conversar com vendedores.</p>
          <ul className="mt-6 space-y-2 text-sm text-ink-700">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Checkout seguro via Stripe</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Histórico de pedidos e avaliações</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Chat direto com o vendedor</li>
          </ul>
          <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
            Criar conta de comprador <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link to="/register/seller" data-testid="pick-seller"
              className="group relative flex flex-col rounded-3xl border border-black/10 bg-ink-900 p-8 text-white transition hover:-translate-y-1 hover:shadow-xl">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500 text-white">
            <Store className="h-5 w-5" />
          </span>
          <h2 className="mt-6 font-display text-2xl font-extrabold">Sou vendedor</h2>
          <p className="mt-2 text-sm text-white/60">Abra sua loja, publique produtos e receba pagamentos pelo Stripe.</p>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Página pública da loja com URL própria</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Painel de produtos, pedidos e mensagens</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-500 shrink-0" /> Recebimentos automáticos via Stripe</li>
          </ul>
          <span className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-500 group-hover:gap-2.5 transition-all">
            Abrir minha loja <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>

      <p className="mt-10 text-center text-sm text-ink-500">
        Já tem conta? <Link to="/login" className="font-medium text-brand-600 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
