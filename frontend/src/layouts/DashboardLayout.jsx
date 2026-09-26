import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useApp } from "@/context/AppContext";
import { api } from "@/lib/api";

export default function DashboardLayout() {
  const { user, t, logout } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const navigate = useNavigate();

  // Admin has a dedicated shell at /app/admin — redirect from the service hub.
  useEffect(() => {
    if (user && typeof user === "object" && user.role === "admin"
        && window.location.pathname === "/app") {
      navigate("/app/admin", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user || typeof user !== "object") return;
    if (user.role === "admin") return; // admin doesn't require payment
    // Re-check /me for payment_required, since login/register may have cached it.
    api.get("/auth/me").then(({ data }) => {
      if (data.payment_required) setPaymentRequired(true);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (paymentRequired) {
      (async () => {
        try { await logout(); } catch {}
        navigate("/register?resume=1", { replace: true });
      })();
    }
  }, [paymentRequired, logout, navigate]);

  if (user === null) {
    return (
      <div data-testid="app-loading" className="flex min-h-screen items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }
  if (user === false) return <Navigate to="/login" replace />;
  if (paymentRequired) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Redirecionando para o pagamento…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block lg:shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      <Sheet open={mobileNav} onOpenChange={setMobileNav}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar onNavigate={() => setMobileNav(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onOpenSearch={() => setSearchOpen(true)} onOpenSidebar={() => setMobileNav(true)} />
        <main data-testid="main-content" className="ls-scroll flex-1 space-y-8 p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} setOpen={setSearchOpen} />
    </div>
  );
}
