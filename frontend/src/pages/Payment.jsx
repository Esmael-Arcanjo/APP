import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Logo } from "@/components/Logo";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = params.get("session_id");
  const [state, setState] = useState({ status: "polling", data: null });

  useEffect(() => {
    if (!sessionId) { setState({ status: "error", data: null }); return; }
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      tries += 1;
      try {
        const { data } = await api.get(`/billing/status/${sessionId}`);
        if (cancelled) return;
        if (data.payment_status === "paid") {
          setState({ status: "paid", data });
        } else if (tries >= 20) {
          setState({ status: "pending", data });
        } else {
          setTimeout(poll, 1500);
        }
      } catch {
        if (tries < 5) setTimeout(poll, 2000);
        else setState({ status: "error", data: null });
      }
    };
    poll();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div data-testid="payment-success-card" className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <Logo />
        <div className="mt-6">
          {state.status === "polling" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="mt-4 font-display text-2xl font-extrabold">Confirmando pagamento…</h1>
              <p className="mt-2 text-sm text-muted-foreground">Aguarde alguns segundos.</p>
            </>
          )}
          {state.status === "paid" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h1 className="mt-4 font-display text-2xl font-extrabold">Pagamento confirmado</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Seu serviço {state.data?.service} foi ativado.
              </p>
              <Button data-testid="go-app" onClick={() => navigate("/app")} className="mt-6 h-11 w-full rounded-full">
                Ir ao dashboard
              </Button>
            </>
          )}
          {state.status === "pending" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-amber-500" />
              <h1 className="mt-4 font-display text-2xl font-extrabold">Ainda processando</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Você receberá acesso assim que o pagamento for confirmado.
              </p>
              <Button onClick={() => navigate("/login")} className="mt-6 h-11 w-full rounded-full">
                Ir ao login
              </Button>
            </>
          )}
          {state.status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h1 className="mt-4 font-display text-2xl font-extrabold">Não foi possível verificar</h1>
              <p className="mt-2 text-sm text-muted-foreground">Tente entrar novamente para conferir seu plano.</p>
              <Button onClick={() => navigate("/login")} className="mt-6 h-11 w-full rounded-full">
                Ir ao login
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentCancel() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6">
      <div data-testid="payment-cancel-card" className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
        <Logo />
        <XCircle className="mx-auto mt-6 h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Pagamento cancelado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Você precisa concluir o pagamento para acessar sua conta LEAMSE. Você pode tentar novamente
          agora ou entrar depois para retomar.
        </p>
        <div className="mt-6 grid gap-2">
          <Button data-testid="cancel-back-register" onClick={() => navigate("/register?resume=1")}
                  className="h-11 w-full rounded-full">
            Tentar novamente
          </Button>
          <Button data-testid="cancel-back-login" onClick={() => navigate("/login")}
                  variant="outline" className="h-11 w-full rounded-full">
            Ir ao login
          </Button>
        </div>
      </div>
    </div>
  );
}
