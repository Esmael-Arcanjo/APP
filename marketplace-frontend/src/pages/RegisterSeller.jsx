import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Store, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errMsg } from "@/lib/api";

export default function RegisterSeller() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: "", store_name: "", email: "", password: "", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (user && typeof user === "object") return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, user_type: "seller" });
      toast.success("Loja criada — comece publicando produtos");
      nav("/seller");
    } catch (err) { toast.error(errMsg(err)); }
    finally { setLoading(false); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto grid max-w-3xl gap-8 px-6 py-10 md:grid-cols-[1fr,300px]">
      <form onSubmit={submit} className="w-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm" data-testid="register-seller-form">
        <Link to="/register" className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-brand-600" data-testid="back-picker">
          <ArrowLeft className="h-3 w-3" /> Escolher outro tipo
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-white">
            <Store className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Abrir minha loja</h1>
            <p className="text-xs text-ink-500">Você recebe os pagamentos pelo Stripe direto na sua conta</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Nome da loja</label>
            <input required value={form.store_name} onChange={set("store_name")} data-testid="rs-store"
                   placeholder="Ex: Ateliê da Ana"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
            <p className="mt-1 text-xs text-ink-500">A URL pública da sua loja será gerada a partir desse nome.</p>
          </div>
          <div>
            <label className="text-sm font-medium">Nome do responsável</label>
            <input required value={form.name} onChange={set("name")} data-testid="rs-name"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input type="email" required value={form.email} onChange={set("email")} data-testid="rs-email"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone <span className="text-ink-500">(opcional)</span></label>
            <input value={form.phone} onChange={set("phone")} data-testid="rs-phone"
                   placeholder="(11) 99999-0000"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required minLength={6}
                     value={form.password} onChange={set("password")} data-testid="rs-password"
                     className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm outline-none focus:border-brand-500" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-0 top-0 mt-1 grid h-11 w-11 place-items-center text-ink-500"
                      data-testid="rs-toggle-pass">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="rs-submit"
                  className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
            {loading ? "Criando loja…" : "Abrir minha loja"}
          </button>
          <p className="text-center text-sm text-ink-500">
            Já tem conta? <Link to="/login" className="font-medium text-brand-600 hover:underline">Entrar</Link>
          </p>
        </div>
      </form>
      <aside className="hidden h-fit rounded-2xl border border-black/5 bg-brand-50/60 p-6 text-sm md:block">
        <h3 className="font-display text-base font-bold">O que você recebe</h3>
        <ul className="mt-4 space-y-3 text-ink-700">
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" /> Página pública da loja com URL própria</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" /> Painel para gerenciar produtos e pedidos</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" /> Chat direto com compradores</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-brand-600" /> Recebimentos pelo Stripe</li>
        </ul>
      </aside>
    </div>
  );
}
