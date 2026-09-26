import { NavLink, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, ClipboardList, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/store/cart";

/** Bottom nav — visible only on mobile (< md). Sits above safe-area on iOS.
 *  Hidden inside admin/login/register pages. */
export function BottomNav() {
  const { user } = useAuth();
  const count = useCart((s) => s.count());
  const location = useLocation();
  // Hide on admin, login, register pages
  const hide = /^\/(admin|login|register)/.test(location.pathname);
  if (hide) return null;

  const isLogged = user && typeof user === "object";
  const isSeller = isLogged && user.user_type === "seller";
  const ordersHref = isSeller ? "/seller/orders" : "/buyer/orders";
  const profileHref = isSeller ? "/seller" : (isLogged ? "/buyer" : "/login");
  const messagesHref = "/messages";

  const items = [
    { to: "/", label: "Início", icon: Home, end: true, testId: "bn-home" },
    { to: "/cart", label: "Carrinho", icon: ShoppingBag, badge: count, testId: "bn-cart" },
    { to: messagesHref, label: "Mensagens", icon: MessageCircle, requiresAuth: true, testId: "bn-messages" },
    { to: ordersHref, label: "Pedidos", icon: ClipboardList, requiresAuth: true, testId: "bn-orders" },
    { to: profileHref, label: isLogged ? "Perfil" : "Entrar", icon: User, testId: "bn-profile" },
  ];

  return (
    <nav
      data-testid="bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="Navegação inferior"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((it) => {
          if (it.requiresAuth && !isLogged) return (
            <li key={it.testId}>
              <NavLink to="/login" data-testid={it.testId}
                       className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-ink-500">
                <it.icon className="h-5 w-5" />
                <span>{it.label}</span>
              </NavLink>
            </li>
          );
          return (
            <li key={it.testId}>
              <NavLink to={it.to} end={it.end} data-testid={it.testId}
                       className={({ isActive }) => `relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                         isActive ? "text-brand-600" : "text-ink-500"
                       }`}>
                {({ isActive }) => (
                  <>
                    <span aria-hidden className={`absolute inset-x-6 top-0 h-0.5 rounded-b-full bg-brand-500 transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`} />
                    <span className="relative">
                      <it.icon className="h-5 w-5" />
                      {it.badge > 0 && (
                        <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                          {it.badge}
                        </span>
                      )}
                    </span>
                    <span>{it.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
