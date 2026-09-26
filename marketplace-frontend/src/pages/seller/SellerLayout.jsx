import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, MessageCircle, Store, ExternalLink, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const item = "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";
const activeCls = "bg-brand-50 text-brand-600 font-semibold";
const inactiveCls = "text-ink-500 hover:bg-black/5 hover:text-ink-900";

function NavRow({ to, label, icon: Icon, end, testId }) {
  return (
    <NavLink to={to} end={end} data-testid={testId}
      className={({ isActive }) => `${item} ${isActive ? activeCls : inactiveCls}`}>
      {({ isActive }) => (
        <>
          <span aria-hidden className={`absolute inset-y-2 left-0 w-1 rounded-r-full bg-brand-500 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
          <Icon className="h-[18px] w-[18px] shrink-0" />
          <span className="hidden truncate group-hover/side:inline">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function SellerLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  if (user === null) return <div className="p-10 text-sm text-ink-500">Carregando…</div>;
  if (user === false) return <Navigate to="/login?next=/seller" replace />;
  if (user.user_type !== "seller") return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-brand-50/30">
      <aside data-testid="seller-sidebar"
             className="group/side sticky top-16 flex h-[calc(100vh-4rem)] w-16 shrink-0 flex-col border-e border-black/5 bg-white transition-[width] duration-200 ease-out hover:w-60">
        <div className="flex h-16 items-center gap-2 px-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white">
            <Store className="h-4 w-4" />
          </span>
          <div className="hidden min-w-0 flex-1 group-hover/side:block">
            <p className="truncate font-display text-sm font-bold">{user.store_name || "Minha loja"}</p>
            <p className="truncate text-[11px] text-ink-500">Painel do vendedor</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-3">
          <NavRow to="/seller" end label="Visão geral" icon={LayoutDashboard} testId="seller-nav-overview" />
          <NavRow to="/seller/products" label="Produtos" icon={Package} testId="seller-nav-products" />
          <NavRow to="/seller/orders" label="Pedidos" icon={ShoppingBag} testId="seller-nav-orders" />
          <NavRow to="/seller/messages" label="Mensagens" icon={MessageCircle} testId="seller-nav-messages" />
          <NavRow to="/seller/profile" label="Perfil da loja" icon={Store} testId="seller-nav-profile" />
        </nav>
        <div className="space-y-1 border-t border-black/5 p-2">
          {user.slug && (
            <a href={`/store/${user.slug}`} target="_blank" rel="noreferrer"
               data-testid="seller-view-store"
               className={`${item} ${inactiveCls}`}>
              <ExternalLink className="h-[18px] w-[18px] shrink-0" />
              <span className="hidden group-hover/side:inline">Ver loja pública</span>
            </a>
          )}
          <button onClick={async () => { await logout(); nav("/"); }}
                  data-testid="seller-logout"
                  className={`${item} w-full ${inactiveCls}`}>
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            <span className="hidden group-hover/side:inline">Sair</span>
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
