import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import { HOME, PRODUCT } from '../constants/testIds';
import MainLayout from '../layouts/MainLayout';

const DEFAULT_BANNERS = [
  { id: 'b1', title: '', subtitle: '', image_url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1920&h=500&fit=crop' },
  { id: 'b2', title: '', subtitle: '', image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=500&fit=crop' },
  { id: 'b3', title: '', subtitle: '', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&h=500&fit=crop' },
];

const ProductCard = ({ product, formatPrice, canAddToCart, onAdd, navigate }) => (
  <div data-testid={PRODUCT.card} className="bg-white border border-gray-200 rounded-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group text-black">
    <div className="aspect-square bg-gray-50 overflow-hidden" onClick={() => navigate(`/product/${product.id}`)}>
      {product.images?.[0] ? (
        <img data-testid={PRODUCT.image} src={product.images[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem imagem</div>
      )}
    </div>
    <div className="p-2.5 space-y-1">
      <h3 data-testid={PRODUCT.name} className="text-sm leading-snug line-clamp-2 hover:text-[#c7511f] cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        {product.name}
      </h3>
      {product.average_rating > 0 && (
        <div className="flex items-center gap-1 text-xs">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(product.average_rating) ? 'fill-[#f3a847] text-[#f3a847]' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-blue-600">{product.total_reviews || 0}</span>
        </div>
      )}
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] align-top">R$</span>
        <span data-testid={PRODUCT.price} className="text-xl font-bold leading-none">
          {formatPrice(product.promotional_price || product.price).replace(/[^\d,.]/g, '')}
        </span>
        {product.promotional_price && (
          <span className="text-xs text-gray-500 line-through">{formatPrice(product.price)}</span>
        )}
      </div>
      {canAddToCart && (
        <button
          data-testid={PRODUCT.addToCartButton}
          onClick={() => onAdd(product.id)}
          disabled={product.stock === 0}
          className="w-full py-1.5 mt-1 rounded-full text-xs font-semibold text-black disabled:opacity-50"
          style={{ background: 'linear-gradient(180deg, #f7ca00 0%, #f0a600 100%)' }}
        >
          {product.stock === 0 ? 'Esgotado' : 'Adicionar ao carrinho'}
        </button>
      )}
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [dbBanners, setDbBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const banners = dbBanners.length > 0 ? dbBanners : DEFAULT_BANNERS;
  const canAddToCart = !user || user?.role === 'client';

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const t = setInterval(() => setCurrentSlide((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  const fetchData = async () => {
    try {
      const [catsRes, prodsRes, bannersRes, annRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products', { params: { limit: 30 } }),
        api.get('/banners').catch(() => ({ data: [] })),
        api.get('/announcements').catch(() => ({ data: [] })),
      ]);
      setCategories(catsRes.data);
      setProducts(prodsRes.data.products || []);
      setDbBanners(bannersRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch (e) { console.error(e); }
  };

  const handleAddToCart = async (id) => {
    if (!user) { navigate('/login'); return; }
    try { await addToCart(id, 1); toast.success('Adicionado ao carrinho!'); }
    catch { toast.error('Erro ao adicionar ao carrinho'); }
  };

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + banners.length) % banners.length);

  // Group products by category for carousels
  const byCategory = categories.map((c) => ({
    category: c,
    items: products.filter((p) => p.category_id === c.id).slice(0, 8),
  })).filter((g) => g.items.length > 0);

  // Deal cards: up to 8 categories with their first product image
  const dealCards = categories.slice(0, 8).map((c) => ({
    ...c,
    productImg: products.find((p) => p.category_id === c.id)?.images?.[0] || c.image_url,
  }));

  return (
    <MainLayout fullWidth={true}>
      <div className="bg-[#e3e6e6] min-h-screen text-black" data-testid="home-root">
        {/* Announcements strip */}
        {announcements.filter(a => a.placement === 'home_top' || a.placement === 'global_banner').length > 0 && (
          <div className="bg-[#232f3e] text-white text-sm overflow-hidden" data-testid={HOME.banner + '-announce'}>
            <div className="animate-marquee whitespace-nowrap flex gap-10 py-1.5 px-4">
              {announcements.filter(a => a.placement === 'home_top' || a.placement === 'global_banner').concat(announcements).map((a, i) => (
                <span key={i}>📣 <strong>{a.title}</strong> — {a.message}</span>
              ))}
            </div>
          </div>
        )}

        {/* Hero banner (moderate height, Amazon-like) */}
        
        {/* Deal cards - Amazon style 4 columns */}
  

        {/* Featured products carousel */}
        {products.length > 0 && (
          <ProductRow title="Produtos em Destaque" products={products.slice(0, 12)} formatPrice={formatPrice} canAddToCart={canAddToCart} onAdd={handleAddToCart} navigate={navigate} />
        )}

        {/* Per-category rows */}
        {byCategory.map((g) => (
          <ProductRow key={g.category.id} title={g.category.name} products={g.items} formatPrice={formatPrice} canAddToCart={canAddToCart} onAdd={handleAddToCart} navigate={navigate} link={`/category/${g.category.slug}`} />
        ))}

        {products.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>Nenhum produto disponível ainda. Aguarde os primeiros vendedores publicarem seus produtos!</p>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-[#232f3e] text-white mt-10">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-full py-3 bg-[#37475a] hover:bg-[#485769] text-sm font-medium">Voltar ao topo</button>
          <div className="bg-[#131a22] text-center text-xs py-4 text-gray-400">© 2026 WIBAZA. Todos os direitos reservados.</div>
        </footer>
      </div>
    </MainLayout>
  );
};

const ProductRow = ({ title, products, formatPrice, canAddToCart, onAdd, navigate, link }) => {
  const scrollRef = useRef(null);
  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir * 500, behavior: 'smooth' });
  };
  return (
    <div className="px-3 md:px-4 py-4">
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
          {link && <Link to={link} className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline">Ver todos</Link>}
        </div>
        <div className="relative">
          <button onClick={() => scroll(-1)} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-16 bg-white shadow-lg hover:bg-gray-50 items-center justify-center rounded"><ChevronLeft className="w-5 h-5" /></button>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar snap-x scroll-smooth">
            {products.map((p) => (
              <div key={p.id} className="min-w-[160px] w-[160px] md:min-w-[200px] md:w-[200px] snap-start">
                <ProductCard product={p} formatPrice={formatPrice} canAddToCart={canAddToCart} onAdd={onAdd} navigate={navigate} />
              </div>
            ))}
          </div>
          <button onClick={() => scroll(1)} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-16 bg-white shadow-lg hover:bg-gray-50 items-center justify-center rounded"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
