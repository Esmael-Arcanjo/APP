import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errMsg } from "@/lib/api";

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();

  if (user && typeof user === "object") return <Navigate to={params.get("next") || "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo");
      nav(params.get("next") || "/");
    } catch (err) { toast.error(errMsg(err)); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md items-center px-6 py-10">
      <form onSubmit={submit} className="w-full rounded-2xl border border-black/5 bg-white p-8 shadow-sm" data-testid="login-form">
        <h1 className="font-display text-2xl font-extrabold">Entrar</h1>
        <p className="mt-1 text-sm text-ink-500">Bem-vindo ao LEAMSE Shop</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                   className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                   data-testid="login-email" />
          </div>
          <div>
            <label className="text-sm font-medium">Senha</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 pr-11 text-sm outline-none focus:border-brand-500"
                     data-testid="login-password" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-0 top-0 mt-1 grid h-11 w-11 place-items-center text-ink-500 hover:text-ink-900"
                      data-testid="login-toggle-pass">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} data-testid="login-submit"
                  className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600">
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <p className="text-center text-sm text-ink-500">
            Não tem conta? <Link to="/register" className="font-medium text-brand-600 hover:underline">Criar conta</Link>
          </p>
        </div>
      </form>
    </div>
  );
}
