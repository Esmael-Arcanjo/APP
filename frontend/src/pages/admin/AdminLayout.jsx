import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Tag, LineChart, Ticket, LogOut, ShieldCheck, Settings as SettingsIcon, Globe, Moon, Sun, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/lib/i18n";

const AdminNavItem = ({ to, label, icon: Icon, end, testId }) => (
  <NavLink to={to} end={end} data-testid={testId} title={label}
           className={({ isActive }) =>
             `group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
               isActive ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
             }`}>
    {({ isActive }) => (
      <>
        <span aria-hidden
              className={`absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="hidden truncate group-hover/side:inline">{label}</span>
      </>
    )}
  </NavLink>
);

export default function AdminLayout() {
  const { user, logout, theme, setTheme, locale, setLocale, t } = useApp();
  const navigate = useNavigate();

  if (user === null) return <div className="p-10 text-sm text-muted-foreground">Carregando…</div>;
  if (user === false) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/app" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      <aside data-testid="admin-sidebar"
             className="group/side sticky top-0 flex h-screen w-16 shrink-0 flex-col border-e border-border bg-card transition-[width] duration-200 ease-out hover:w-64">
        <div className="flex h-16 items-center gap-3 px-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="hidden min-w-0 flex-1 group-hover/side:block">
            <p className="truncate font-display text-sm font-bold">Painel Admin</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">Controle total</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          <AdminNavItem to="/app/admin" end label="Visão geral" icon={LayoutDashboard} testId="admin-nav-overview" />
          <AdminNavItem to="/app/admin/users" label="Usuários" icon={Users} testId="admin-nav-users" />
          <AdminNavItem to="/app/admin/pricing" label="Preços" icon={Tag} testId="admin-nav-pricing" />
          <AdminNavItem to="/app/admin/coupons" label="Cupons" icon={Ticket} testId="admin-nav-coupons" />
          <AdminNavItem to="/app/admin/metrics" label="Métricas" icon={LineChart} testId="admin-nav-metrics" />
        </nav>
        <div className="space-y-1 border-t border-border p-2">
          <AdminNavItem to="/app/settings" label="Configurações" icon={SettingsIcon} testId="admin-nav-settings" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl sm:px-6">
          <Logo size={28} />
          <div className="ms-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex">
                  <Globe className="h-[18px] w-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
                {LANGUAGES.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setLocale(l.code)}
                                    className={locale === l.code ? "font-semibold text-primary" : ""}>
                    {l.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="rounded-full"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="admin-profile-btn">
                  <User className="h-[18px] w-[18px]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-xs font-normal text-muted-foreground">{user.email}</p>
                  <Badge className="mt-2 rounded-full bg-primary text-xs">admin</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>{t("common.profile")}</DropdownMenuItem>
                <DropdownMenuItem data-testid="admin-logout" onClick={async () => { await logout(); navigate("/login"); }}>
                  <LogOut className="me-2 h-4 w-4" /> {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 space-y-8 p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
