import { useNavigate } from "react-router-dom";
import { Globe, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/context/AppContext";
import { LANGUAGES } from "@/lib/i18n";

export const Topbar = ({ onOpenSearch, onOpenSidebar }) => {
  const { t, user, theme, setTheme, locale, setLocale, logout, organization } = useApp();
  const navigate = useNavigate();

  return (
    <header
      data-testid="topbar"
      className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl sm:px-6"
    >
      <button
        data-testid="mobile-menu-btn"
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ms-auto flex min-w-0 items-center gap-1 sm:gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="language-switcher" variant="ghost" size="icon" className="hidden rounded-full sm:inline-flex">
              <Globe className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem key={l.code} data-testid={`language-option-${l.code}`}
                                onClick={() => setLocale(l.code)}
                                className={locale === l.code ? "font-semibold text-primary" : ""}>
                {l.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button data-testid="theme-toggle" variant="ghost" size="icon" className="rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button data-testid="profile-btn" variant="ghost" size="icon" className="rounded-full">
              <User className="h-[18px] w-[18px]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs font-normal text-muted-foreground">{user?.email}</p>
              {organization?.name && (
                <p className="mt-1 text-xs font-normal text-muted-foreground">{organization.name}</p>
              )}
              <Badge variant="outline" className="mt-2 rounded-full text-xs">{user?.role}</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/app/settings")}>{t("common.profile")}</DropdownMenuItem>
            <DropdownMenuItem data-testid="logout-btn" onClick={async () => { await logout(); navigate("/login"); }}>
              <LogOut className="me-2 h-4 w-4" /> {t("common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
