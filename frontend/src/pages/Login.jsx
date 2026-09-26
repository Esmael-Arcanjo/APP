import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { errMsg } from "@/lib/api";

export default function Login() {
  const { login, user, t } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.welcome"));
      navigate("/app");
    } catch (err) {
      const msg = errMsg(err);
      if (typeof msg === "string" && msg.toLowerCase().includes("pagamento")) {
        toast.error("Pagamento pendente — conclua o pagamento para acessar.");
        setTimeout(() => navigate("/register?resume=1"), 1200);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={submit} className="ls-rise w-full max-w-sm space-y-6" data-testid="login-form">
          <Link to="/"><Logo /></Link>
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{t("auth.welcome")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("common.email")}</Label>
            <Input id="email" data-testid="login-email" type="email" required value={email}
                   onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <div className="relative">
              <Input id="password" data-testid="login-password"
                     type={showPass ? "text" : "password"} required value={password}
                     onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                     className="h-11 rounded-xl pr-11" />
              <button type="button" data-testid="login-toggle-pass"
                      onClick={() => setShowPass((v) => !v)}
                      aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                      className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button data-testid="login-submit" type="submit" disabled={loading} className="h-11 w-full rounded-full">
            {loading ? t("common.loading") : t("auth.login")}
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link to="/register" data-testid="go-register" className="font-medium text-primary hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </form>
      </div>
      <aside className="relative hidden items-center justify-center border-s border-border ls-surface ls-grain lg:flex">
        <div className="max-w-md px-12">
          <p className="font-display text-3xl font-extrabold leading-tight">
            Uma conta. Um projeto. Uma API Key.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Payments, Marketplace, Email, Wallet, Ledger e Analytics — módulos comerciais
            independentes sob a mesma infraestrutura LEAMSE.
          </p>
        </div>
      </aside>
    </div>
  );
}
