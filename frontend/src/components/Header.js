import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, Moon, Sun, Globe, Search, Home, MapPin, MessageCircle, LogIn, LayoutDashboard, X, Menu, ChevronDown } from 'lucide-react';
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
  const [searchCategory, setSearchCategory] = useState('all');
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
      const params = new URLSearchParams({ q: searchQuery.trim() });
      if (searchCategory !== 'all') params.append('category', searchCategory);
      navigate(`/search?${params.toString()}`);
      setMobileMenuOpen(false);
    }
  };

  const openChatbot = () => {
    document.querySelector('[data-testid="virtual-assistant-toggle"]')?.click();
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Amazon-style dark header */}
      <header className="sticky top-0 z-40" data-testid="site-header">
        {/* Top bar */}
        <div className="bg-[#131921] text-white">
          <div className="w-full px-2 md:px-4">
            {/* Desktop */}
            <div className="hidden md:flex items-center h-14 gap-2">
              <Link to="/" data-testid={HEADER.logo} className="flex items-center px-2 py-1 rounded border border-transparent hover:border-white transition-colors">
                <img src="/logo-wibaza.jpg" alt="WIBAZA" className="h-9 w-auto rounded" />
              </Link>

              {/* Deliver to */}
              <button className="hidden lg:flex flex-col items-start px-2 py-1 rounded border border-transparent hover:border-white transition-colors text-left">
                <span className="text-[11px] text-gray-300 flex items-center gap-1"><MapPin className="w-3 h-3" />Entregar em</span>
                <span className="text-sm font-bold leading-tight">Querque Lugar</span>
              </button>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-3xl h-10 rounded-md overflow-hidden bg-white flex">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  data-testid="header-search-category"
                  className="bg-gray-100 text-black text-xs px-2 border-r border-gray-300 focus:outline-none max-w-[140px]"
                >
                  <option value="all">Todos</option>
                  {navCategories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <input
                  data-testid={HEADER.searchInput}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar na WIBAZA..."
                  className="flex-1 px-3 text-sm text-black focus:outline-none"
                />
                <button
                  type="submit"
                  data-testid="header-search-button"
                  className="w-12 flex items-center justify-center text-black hover:brightness-110 transition-all"
                  style={{ background: 'linear-gradient(180deg, #febd69 0%, #f3a847 100%)' }}
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>

              {/* Right controls */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Language / Currency */}
                <div className="relative group px-2 py-1 rounded border border-transparent hover:border-white transition-colors cursor-default">
                  <div className="flex items-center gap-1 text-xs">
                    <Globe className="w-4 h-4" />
                    <span className="font-bold">{language.toUpperCase()}</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white text-black border border-gray-200 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <p className="text-xs px-3 pt-2 pb-1 font-bold text-gray-500">Idioma</p>
                    {['pt', 'en', 'es'].map((lang) => (
                      <button key={lang} onClick={() => changeLanguage(lang)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">{lang === 'pt' ? 'Português' : lang === 'en' ? 'English' : 'Español'}</button>
                    ))}
                    <div className="border-t border-gray-200 my-1" />
                    <p className="text-xs px-3 pt-1 pb-1 font-bold text-gray-500">Moeda</p>
                    {Object.keys(currencies).map((curr) => (
                      <button key={curr} onClick={() => changeCurrency(curr)} className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100">{curr} ({currencies[curr].symbol})</button>
                    ))}
                  </div>
                </div>

                {/* Account */}
                {user ? (
                  <div className="relative group">
                    <button data-testid={HEADER.userMenu} className="px-2 py-1 rounded border border-transparent hover:border-white transition-colors text-left">
                      <span className="block text-[11px] text-gray-300 leading-tight">Olá, {user.name?.split(' ')[0]}</span>
                      <span className="block text-sm font-bold leading-tight flex items-center gap-1">Conta <ChevronDown className="w-3 h-3" /></span>
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-52 bg-white text-black border border-gray-200 rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link to={`/dashboard/${user.role}`} data-testid="menu-dashboard" className="block px-3 py-2 hover:bg-gray-100 text-sm">Dashboard</Link>
                      <Link to="/profile" className="block px-3 py-2 hover:bg-gray-100 text-sm">Meu Perfil</Link>
                      <Link to="/profile" className="block px-3 py-2 hover:bg-gray-100 text-sm">Meus Pedidos</Link>
                      <div className="border-t border-gray-200" />
                      <button onClick={logout} className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-600">Sair</button>
                    </div>
                  </div>
                ) : (
                  <Link to="/login" className="px-2 py-1 rounded border border-transparent hover:border-white transition-colors text-left">
                    <span className="block text-[11px] text-gray-300 leading-tight">Olá, entre</span>
                    <span className="block text-sm font-bold leading-tight">Contas e listas</span>
                  </Link>
                )}

                {/* Orders */}
                {user && (
                  <Link to="/profile" className="hidden lg:block px-2 py-1 rounded border border-transparent hover:border-white transition-colors">
                    <span className="block text-[11px] text-gray-300 leading-tight">Devoluções</span>
                    <span className="block text-sm font-bold leading-tight">e Pedidos</span>
                  </Link>
                )}

                {/* Cart */}
                {canSeeCart && (
                  <Link to={user ? '/cart' : '/login'} data-testid={HEADER.cartIcon} className="flex items-end gap-1 px-2 py-1 rounded border border-transparent hover:border-white transition-colors">
                    <div className="relative">
                      <ShoppingCart className="w-7 h-7" />
                      <span className="absolute -top-1 left-4 text-[#E53E3E] text-sm font-bold">{cartCount || 0}</span>
                    </div>
                    <span className="text-sm font-bold hidden lg:block pb-0.5"></span>
                  </Link>
                )}

                <button data-testid={HEADER.themeToggle} onClick={toggleTheme} className="p-2 rounded border border-transparent hover:border-white transition-colors">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mobile top row */}
            <div className="md:hidden py-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Link to="/" data-testid={HEADER.logo} className="flex items-center">
                  <img src="/logo-wibaza.jpg" alt="WIBAZA" className="h-8 w-auto rounded" />
                </Link>
                
              </div>
              <form onSubmit={handleSearch} className="h-10 rounded-md overflow-hidden bg-white flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar na WIBAZA..."
                  className="flex-1 px-3 text-sm text-black focus:outline-none"
                />
                <button type="submit" data-testid="mobile-search-button" className="w-12 flex items-center justify-center text-black" style={{ background: 'linear-gradient(180deg, #febd69 0%, #f3a847 100%)' }}>
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>

          {/* Secondary nav (categories) */}
          <div className="bg-[#232f3e] text-white">
            <div className="w-full px-2 md:px-4 flex items-center gap-1 overflow-x-auto no-scrollbar py-1.5">
              <button className="flex items-center gap-1 px-2 py-1 text-sm font-semibold whitespace-nowrap rounded border border-transparent hover:border-white transition-colors">
                <Menu className="w-4 h-4" />Todos
              </button>
              {navCategories.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  data-testid={`nav-category-${c.slug}`}
                  className="text-sm whitespace-nowrap px-2 py-1 rounded border border-transparent hover:border-white transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#131921] text-white border-t border-black/40">
        <div className="grid grid-cols-4 h-14">
          <Link to="/" data-testid="mobile-nav-home" className="flex flex-col items-center justify-center gap-0.5 hover:text-[#febd69] transition-colors">
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Início</span>
          </Link>
          {canSeeCart ? (
            <Link to={user ? '/cart' : '/login'} data-testid="mobile-nav-cart" className="flex flex-col items-center justify-center gap-0.5 relative hover:text-[#febd69] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (<span className="absolute top-1 right-1/4 bg-[#f3a847] text-black text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">{cartCount}</span>)}
              <span className="text-[10px]">Carrinho</span>
            </Link>
          ) : (
            <button onClick={() => setMobileMenuOpen(true)} data-testid="mobile-nav-settings" className="flex flex-col items-center justify-center gap-0.5 hover:text-[#febd69]"><Globe className="w-5 h-5" /><span className="text-[10px]">Idioma</span></button>
          )}
          <button data-testid="mobile-nav-chat" onClick={openChatbot} className="flex flex-col items-center justify-center gap-0.5 hover:text-[#febd69] transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px]">Chat</span>
          </button>
          {user ? (
            <button onClick={() => setMobileUserOpen(true)} data-testid="mobile-nav-user" className="flex flex-col items-center justify-center gap-0.5 hover:text-[#febd69] transition-colors">
              <User className="w-5 h-5" /><span className="text-[10px]">Conta</span>
            </button>
          ) : (
            <Link to="/login" data-testid="mobile-nav-login" className="flex flex-col items-center justify-center gap-0.5 hover:text-[#febd69] transition-colors">
              <LogIn className="w-5 h-5" /><span className="text-[10px]">Entrar</span>
            </Link>
          )}
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute bottom-14 left-0 right-0 bg-white text-black rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Configurações</h3>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <label className="text-xs text-gray-500">Idioma</label>
              <div className="grid grid-cols-3 gap-2 mt-1 mb-3">
                {['pt', 'en', 'es'].map((lang) => (
                  <button key={lang} onClick={() => changeLanguage(lang)} className={`py-2 rounded text-sm ${language === lang ? 'bg-[#febd69] text-black' : 'bg-gray-100'}`}>{lang.toUpperCase()}</button>
                ))}
              </div>
              <label className="text-xs text-gray-500">Moeda</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {Object.keys(currencies).map((curr) => (
                  <button key={curr} onClick={() => changeCurrency(curr)} className={`py-2 rounded text-sm ${currency === curr ? 'bg-[#febd69] text-black' : 'bg-gray-100'}`}>{curr}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mobileUserOpen && user && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setMobileUserOpen(false)}>
            <div className="absolute bottom-14 left-0 right-0 bg-white text-black rounded-t-2xl p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div><p className="font-bold">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></div>
                <button onClick={() => setMobileUserOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              <Link to={`/dashboard/${user.role}`} onClick={() => setMobileUserOpen(false)} data-testid="mobile-user-dashboard" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <LayoutDashboard className="w-4 h-4" /><span>Dashboard</span>
              </Link>
              <Link to="/profile" onClick={() => setMobileUserOpen(false)} data-testid="mobile-user-profile" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100">
                <User className="w-4 h-4" /><span>Perfil / Pedidos</span>
              </Link>
              <button onClick={() => { logout(); setMobileUserOpen(false); }} data-testid="mobile-user-logout" className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-red-600 mt-1">
                <LogIn className="w-4 h-4" /><span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Header;
