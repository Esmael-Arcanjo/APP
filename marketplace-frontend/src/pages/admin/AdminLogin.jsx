import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { errMsg } from "@/lib/api";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  if (user && typeof user === "object" && user.user_type === "admin") return <Navigate to="/admin" replace />;
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.user_type !== "admin") {
        toast.error("Esta conta não tem acesso ao painel admin");
        return;
      }
      toast.success("Bem-vindo ao painel");
      nav("/admin");
    } catch (err) { toast.error(errMsg(err)); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-ink-900 text-white">
      <div className="mx-auto grid min-h-screen max-w-md items-center px-6">
        <form onSubmit={submit} className="w-full rounded-2xl bg-white/5 p-8 backdrop-blur" data-testid="admin-login-form">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-xl font-extrabold">Painel Wibaza</h1>
              <p className="text-xs text-white/60">Acesso restrito à administração</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                     className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-brand-500"
                     data-testid="admin-login-email" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-white/60">Senha</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="mt-1 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 pr-11 text-sm text-white outline-none focus:border-brand-500"
                       data-testid="admin-login-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-0 top-0 mt-1 grid h-11 w-11 place-items-center text-white/60 hover:text-white">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} data-testid="admin-login-submit"
                    className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-600">
              {loading ? "Entrando…" : "Entrar no painel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
