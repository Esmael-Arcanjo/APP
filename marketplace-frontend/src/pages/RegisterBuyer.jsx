import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ShoppingBag, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errMsg } from "@/lib/api";

export default function RegisterBuyer() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  if (user && typeof user === "object") return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({ ...form, user_type: "buyer" });
      toast.success("Conta criada — boas compras!");
      nav("/");
    } catch (err) { toast.error(errMsg(err)); }
    finally { setLoading(false); }
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md items-center px-6 py-10">
      <form onSubmit={submit} className="w-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm" data-testid="register-buyer-form">
        <Link to="/register" className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-brand-600" data-testid="back-picker">
          <ArrowLeft className="h-3 w-3" /> Escolher outro tipo
        </Link>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold">Conta de comprador</h1>
            <p className="text-xs text-ink-500">Descobrir lojas e comprar com pagamento seguro</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Nome completo</label>
            <input required value={form.name} onChange={set("name")} data-testid="rb-name"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input type="email" required value={form.email} onChange={set("email")} data-testid="rb-email"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone <span className="text-ink-500">(opcional)</span></label>
            <input value={form.phone} onChange={set("phone")} data-testid="rb-phone"
                   placeholder="(11) 99999-0000"
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required minLength={6}
                     value={form.password} onChange={set("password")} data-testid="rb-password"
                     className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm outline-none focus:border-brand-500" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-0 top-0 mt-1 grid h-11 w-11 place-items-center text-ink-500"
                      data-testid="rb-toggle-pass">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="rb-submit"
                  className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
            {loading ? "Criando…" : "Criar conta de comprador"}
          </button>
          <p className="text-center text-sm text-ink-500">
            Já tem conta? <Link to="/login" className="font-medium text-brand-600 hover:underline">Entrar</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
