import { Navigate, NavLink, Outlet } from "react-router-dom";
import { Shield, Users, Package, ShoppingCart, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  if (user === null) return <div className="p-10 text-sm text-ink-500">Carregando…</div>;
  if (user === false) return <Navigate to="/admin/login" replace />;
  if (user.user_type !== "admin") return <Navigate to="/" replace />;
  const link = "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white";
  const active = "bg-white/15 text-white";
  return (
    <div className="min-h-screen bg-ink-900 text-white" data-testid="admin-layout">
      <div className="mx-auto grid max-w-7xl grid-cols-[240px,1fr] gap-8 px-6 py-8">
        <aside className="rounded-2xl bg-white/5 p-4 backdrop-blur">
          <div className="flex items-center gap-2 px-2 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500">
              <Shield className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-sm font-extrabold">Wibaza Admin</p>
              <p className="text-[11px] text-white/50">{user.email}</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1">
            <NavLink to="/admin" end className={({ isActive }) => `${link} ${isActive ? active : ""}`} data-testid="admin-nav-overview">
              <LayoutDashboard className="h-4 w-4" /> Visão geral
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `${link} ${isActive ? active : ""}`} data-testid="admin-nav-users">
              <Users className="h-4 w-4" /> Usuários
            </NavLink>
            <NavLink to="/admin/products" className={({ isActive }) => `${link} ${isActive ? active : ""}`} data-testid="admin-nav-products">
              <Package className="h-4 w-4" /> Produtos
            </NavLink>
            <NavLink to="/admin/orders" className={({ isActive }) => `${link} ${isActive ? active : ""}`} data-testid="admin-nav-orders">
              <ShoppingCart className="h-4 w-4" /> Pedidos
            </NavLink>
          </nav>
          <button onClick={logout} data-testid="admin-logout"
                  className="mt-6 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </aside>
        <main className="rounded-2xl bg-white p-8 text-ink-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
