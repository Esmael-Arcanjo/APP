import { NavLink, useLocation } from "react-router-dom";
import { Settings as SettingsIcon, BarChart3, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useApp } from "@/context/AppContext";
import { SERVICES, serviceFromPath, enabledServices } from "@/config/services";

/** Hover-to-expand sidebar with a left indicator bar on the active item. */
const NavItem = ({ to, label, icon: Icon, end, accent, onNavigate, testId }) => (
  <NavLink
    to={to} end={end} onClick={onNavigate} data-testid={testId} title={label}
    className={({ isActive }) =>
      `group/item relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`
    }
    style={({ isActive }) => (isActive && accent ? { color: accent } : undefined)}
  >
    {({ isActive }) => (
      <>
        <span
          aria-hidden
          className={`absolute inset-y-2 left-0 w-1 rounded-r-full transition-opacity ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundColor: accent || "hsl(var(--primary))" }}
        />
        <Icon className="h-[18px] w-[18px] shrink-0" />
        <span className="hidden truncate group-hover/side:inline">{label}</span>
      </>
    )}
  </NavLink>
);

export const Sidebar = ({ onNavigate }) => {
  const { services, user } = useApp();
  const location = useLocation();
  const active = serviceFromPath(location.pathname);
  const service = active ? SERVICES[active] : null;
  const enabled = enabledServices(services);

  return (
    <aside data-testid="sidebar"
           className="group/side flex h-full w-16 flex-col border-e border-border bg-card transition-[width] duration-200 ease-out hover:w-64">
      <div className="flex h-16 items-center px-4">
        <Logo size={28} />
      </div>

      <nav className="ls-scroll flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {service ? (
          <>
            <div className="mb-3 hidden items-center gap-2 rounded-xl ls-surface px-3 py-2.5 group-hover/side:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: service.accent }}>
                <service.icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold">{service.name}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Produção</p>
              </div>
            </div>
            {service.nav.map((n) => (
              <NavItem key={n.key} {...n} accent={service.accent} onNavigate={onNavigate} testId={`nav-${n.key}`} />
            ))}
          </>
        ) : (
          <>
            <p className="hidden px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground group-hover/side:block">
              Seus serviços
            </p>
            {enabled.map((s) => (
              <NavItem key={s.id} to={s.base} label={s.name} icon={s.icon} accent={s.accent}
                       onNavigate={onNavigate} testId={`nav-service-${s.id}`} end={s.id === "linkbio"} />
            ))}
          </>
        )}
      </nav>

      <div className="space-y-1 border-t border-border p-2">
        <NavItem to="/app/analytics" label="Analytics" icon={BarChart3} onNavigate={onNavigate} testId="nav-analytics" />
        <NavItem to="/app/settings" label="Configurações" icon={SettingsIcon} onNavigate={onNavigate} testId="nav-settings" />
        {user?.role === "admin" && (
          <NavItem to="/app/admin" label="Admin" icon={ShieldCheck} onNavigate={onNavigate} testId="nav-admin" />
        )}
      </div>
    </aside>
  );
};
