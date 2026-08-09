import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, Moon, Sun, Globe, DollarSign, Search, Home, MessageCircle, LogIn, LayoutDashboard, ChevronUp, X, Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HEADER } from '../constants/testIds';
import api from '../services/api';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { currency, changeCurrency, currencies } = useCurrency();
  const { cartCount } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);
  const [navCategories, setNavCategories] = useState([]);

  useEffect(() => {
    api.get('/categories').then((r) => setNavCategories(r.data || [])).catch(() => {});
  }, []);

  const canSeeCart = !user || user?.role === 'client';

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const openChatbot = () => {
    document.querySelector('[data-testid="virtual-assistant-toggle"]')?.click();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between h-16 gap-4">
            <Link to="/" data-testid={HEADER.logo} className="flex items-center gap-2 shrink-0">
              <img src="/logo-wibaza.jpg" alt="WIBAZA" className="h-10 w-auto rounded-md" />
            </Link>

            <form onSubmit={handleSearch} className="flex flex-1 max-w-2xl relative">
              <input
                data-testid={HEADER.searchInput}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + ' produtos...'}
                className="w-full h-11 pl-4 pr-14 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button type="submit" data-testid="header-search-button" className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center gap-3 shrink-0">
              <div className="relative group">
                <button data-testid={HEADER.languageSwitch} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <Globe className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {['pt', 'en', 'es'].map((lang) => (
                    <button key={lang} onClick={() => changeLanguage(lang)} className="w-full px-4 py-2 text-left hover:bg-muted transition-colors">
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <button data-testid={HEADER.currencySwitch} className="p-2 rounded-full hover:bg-muted transition-colors">
                  <DollarSign className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  {Object.keys(currencies).map((curr) => (
                    <button key={curr} onClick={() => changeCurrency(curr)} className="w-full px-4 py-2 text-left hover:bg-muted transition-colors">
                      {curr} ({currencies[curr].symbol})
                    </button>
                  ))}
                </div>
              </div>

              <button data-testid={HEADER.themeToggle} onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {canSeeCart && user && (
                <Link to="/cart" data-testid={HEADER.cartIcon} className="relative p-2 rounded-full hover:bg-muted transition-colors">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="relative group">
                  <button data-testid={HEADER.userMenu} className="flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to={`/dashboard/${user.role}`} className="block px-4 py-2 hover:bg-muted transition-colors">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-muted transition-colors">Perfil</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-red-500">
                      {t('common.logout')}
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium">
                  {t('common.login')}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Layout - Logo + Search only */}
          <div className="md:hidden py-3 space-y-3">
            <div className="flex items-center justify-between">
              <Link to="/" data-testid={HEADER.logo} className="flex items-center gap-2">
                <img src="/logo-wibaza.jpg" alt="WIBAZA" className="h-8 w-auto rounded-md" />
              </Link>
              <div className="flex items-center gap-1">
                <button data-testid={HEADER.themeToggle} onClick={toggleTheme} className="p-2 rounded-full hover:bg-muted transition-colors">
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {user && (
                  <Link to="/profile" className="p-2 rounded-full hover:bg-muted transition-colors">
                    <User className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.search') + ' produtos...'}
                className="w-full h-11 pl-4 pr-14 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button type="submit" data-testid="mobile-search-button" className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Amazon-style secondary nav (categories strip) */}
        {navCategories.length > 0 && (
          <div className="bg-secondary text-secondary-foreground border-b border-black/20">
            <div className="w-full px-2 sm:px-4 lg:px-8 flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar py-2">
              <Menu className="w-4 h-4 mr-1 shrink-0" />
              {navCategories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  data-testid={`nav-category-${c.slug}`}
                  className="text-xs md:text-sm whitespace-nowrap px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-4 h-16">
          <Link to="/" data-testid="mobile-nav-home" className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Link>
          {canSeeCart ? (
            <Link to={user ? '/cart' : '/login'} data-testid="mobile-nav-cart" className="flex flex-col items-center justify-center gap-1 relative hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-2 right-1/4 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="text-xs">Carrinho</span>
            </Link>
          ) : (
            <button onClick={() => setMobileMenuOpen(true)} data-testid="mobile-nav-settings" className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors">
              <Globe className="w-5 h-5" />
              <span className="text-xs">Idioma</span>
            </button>
          )}
          <button data-testid="mobile-nav-chat" onClick={openChatbot} className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </button>
          {user ? (
            <button
              onClick={() => setMobileUserOpen(true)}
              data-testid="mobile-nav-user"
              className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Conta</span>
            </button>
          ) : (
            <Link to="/login" data-testid="mobile-nav-login" className="flex flex-col items-center justify-center gap-1 hover:text-primary transition-colors">
              <LogIn className="w-5 h-5" />
              <span className="text-xs">Entrar</span>
            </Link>
          )}
        </div>

        {/* Settings drawer for language/currency (only shown for admin/seller since they don't have cart button) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute bottom-16 left-0 right-0 bg-surface border-t border-border rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Configurações</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Idioma</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {['pt', 'en', 'es'].map((lang) => (
                      <button key={lang} onClick={() => changeLanguage(lang)} className={`py-2 rounded-lg text-sm ${language === lang ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Moeda</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {Object.keys(currencies).map((curr) => (
                      <button key={curr} onClick={() => changeCurrency(curr)} className={`py-2 rounded-lg text-sm ${currency === curr ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User submenu drawer - only opens when logged in */}
        {mobileUserOpen && user && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileUserOpen(false)}>
            <div className="absolute bottom-16 left-0 right-0 bg-surface border-t border-border rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button onClick={() => setMobileUserOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                <Link to={`/dashboard/${user.role}`} onClick={() => setMobileUserOpen(false)} data-testid="mobile-user-dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/profile" onClick={() => setMobileUserOpen(false)} data-testid="mobile-user-profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                  <User className="w-4 h-4" />
                  <span>Perfil</span>
                </Link>
                <div className="border-t border-border my-2" />
                <div className="grid grid-cols-3 gap-2">
                  {['pt', 'en', 'es'].map((lang) => (
                    <button key={lang} onClick={() => changeLanguage(lang)} className={`py-2 rounded-lg text-sm ${language === lang ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(currencies).map((curr) => (
                    <button key={curr} onClick={() => changeCurrency(curr)} className={`py-2 rounded-lg text-sm ${currency === curr ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {curr}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { logout(); setMobileUserOpen(false); }}
                  data-testid="mobile-user-logout"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-red-500 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
