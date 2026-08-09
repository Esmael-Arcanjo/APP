import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import { HOME, PRODUCT } from '../constants/testIds';
import MainLayout from '../layouts/MainLayout';

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

  const canAddToCart = !user || user?.role === 'client';

  const defaultBanners = [
    {
      id: 1,
      title: 'Bem-vindo ao WIBAZA',
      subtitle: 'Seu Marketplace Internacional',
      image_url: 'https://images.pexels.com/photos/5872176/pexels-photo-5872176.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=1920',
    },
    {
      id: 2,
      title: 'Produtos de Qualidade',
      subtitle: 'Vendedores Verificados',
      image_url: 'https://images.pexels.com/photos/32912307/pexels-photo-32912307.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=1920',
    },
    {
      id: 3,
      title: 'Entregas Rápidas',
      subtitle: 'Para Todo o Mundo',
      image_url: 'https://images.pexels.com/photos/29505140/pexels-photo-29505140.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=1920',
    },
  ];

  const banners = dbBanners.length > 0 ? dbBanners : defaultBanners;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const fetchData = async () => {
    try {
      const [catsRes, prodsRes, bannersRes, annRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products', { params: { limit: 12 } }),
        api.get('/banners').catch(() => ({ data: [] })),
        api.get('/announcements').catch(() => ({ data: [] })),
      ]);
      setCategories(catsRes.data);
      setProducts(prodsRes.data.products || []);
      setDbBanners(bannersRes.data || []);
      setAnnouncements(annRes.data || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId, 1);
      toast.success('Produto adicionado ao carrinho!');
    } catch (error) {
      toast.error('Erro ao adicionar ao carrinho');
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <MainLayout fullWidth={true}>
      {/* Banner Slider - 100% width */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden" data-testid={HOME.banner}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img src={banners[currentSlide].image_url || banners[currentSlide].image} alt={banners[currentSlide].title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
              <div className="max-w-2xl px-6 md:px-12">
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
                  {banners[currentSlide].title}
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-white/90">
                  {banners[currentSlide].subtitle}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Announcements top strip */}
      {announcements.filter(a => a.placement === 'home_top').length > 0 && (
        <div className="bg-yellow-400 text-black py-2 overflow-hidden" data-testid="home-announcements">
          <div className="animate-marquee whitespace-nowrap flex gap-8 px-4">
            {announcements.filter(a => a.placement === 'home_top' || a.placement === 'global_banner').map((a, i) => (
              <span key={i} className="text-sm font-semibold">📣 {a.title}: {a.message}</span>
            ))}
          </div>
        </div>
      )}

      {/* Categories Amazon Style */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              data-testid={HOME.categoryCard}
              className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary transition-all group"
            >
              <div className="aspect-square bg-muted overflow-hidden">
                <img
                  src={category.image_url || 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=400'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-sm md:text-base">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Produtos em Destaque
          </h2>

          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum produto disponível ainda.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  data-testid={PRODUCT.card}
                  className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all group"
                >
                  <div className="aspect-square bg-muted overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.images?.[0] ? (
                      <img data-testid={PRODUCT.image} src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem imagem</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 data-testid={PRODUCT.name} className="font-medium text-sm mb-1 line-clamp-2 cursor-pointer h-10" onClick={() => navigate(`/product/${product.id}`)}>
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      {product.promotional_price ? (
                        <>
                          <span data-testid={PRODUCT.price} className="text-lg font-bold text-primary">{formatPrice(product.promotional_price)}</span>
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                        </>
                      ) : (
                        <span data-testid={PRODUCT.price} className="text-lg font-bold text-primary">{formatPrice(product.price)}</span>
                      )}
                    </div>
                    {canAddToCart && (
                      <button
                        data-testid={PRODUCT.addToCartButton}
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                        className="w-full py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {product.stock === 0 ? 'Esgotado' : 'Adicionar'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;
