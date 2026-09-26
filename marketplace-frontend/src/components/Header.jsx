import { Link, useNavigate } from "react-router-dom";
import { Search, User, LogOut, ShoppingBag, LayoutDashboard, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/store/cart";

/** Header — on mobile only brand + search are visible. Desktop keeps the
 *  full nav; the mobile bottom nav (see BottomNav.jsx) handles Cart / Pedidos / Mensagens. */
export function Header() {
  const { user, logout } = useAuth();
  const count = useCart((s) => s.count());
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const submit = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); };
  const dashboardHref = user?.user_type === "seller" ? "/seller" : "/buyer";

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" data-testid="brand"
              className="font-display text-xl font-black tracking-tight sm:text-2xl">
          Wibaza
        </Link>
        <form onSubmit={submit} className="ms-auto flex-1 max-w-md">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input value={q} onChange={(e) => setQ(e.target.value)}
                   placeholder="Buscar produtos…"
                   className="h-10 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm outline-none focus:border-brand-500"
                   data-testid="search-input" />
          </div>
        </form>

        {/* Desktop-only actions */}
        <nav className="hidden items-center gap-2 md:flex">
          {user && (user.user_type === "buyer" || user.user_type === "seller") && (
            <Link to={dashboardHref} className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-black/5" data-testid="nav-dashboard">
              <LayoutDashboard className="me-1.5 h-4 w-4 inline" /> Painel
            </Link>
          )}
          {user && (user.user_type === "buyer" || user.user_type === "seller") && (
            <Link to="/messages" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-black/5" data-testid="nav-messages">
              <MessageCircle className="me-1.5 h-4 w-4 inline" /> Mensagens
            </Link>
          )}
          <Link to="/cart" className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-black/5" data-testid="nav-cart">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <button onClick={logout} className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-black/5" data-testid="nav-logout">
              <LogOut className="me-1 h-4 w-4 inline" /> Sair
            </button>
          ) : (
            <>
              <Link to="/login" className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-black/5" data-testid="nav-login">
                <User className="me-1 h-4 w-4 inline" /> Entrar
              </Link>
              <Link to="/register" className="rounded-full bg-brand-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-600" data-testid="nav-register">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
