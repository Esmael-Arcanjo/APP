import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Search } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import { PRODUCT } from '../constants/testIds';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const canAddToCart = !user || user?.role === 'client';

  useEffect(() => {
    fetchProducts();
  }, [query]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params: { search: query, limit: 50 } });
      setProducts(data.products || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchParams({ q: localQuery.trim() });
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
      toast.error('Erro ao adicionar');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="relative max-w-2xl">
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Buscar produtos..."
            className="w-full px-4 py-3 pr-14 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button type="submit" data-testid="search-page-submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
            <Search className="w-5 h-5" />
          </button>
        </form>

        {query && (
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Resultados para "{query}"
          </h1>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product, index) => (
              <motion.div key={product.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: index * 0.03 }} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-primary transition-all group">
                <div className="aspect-square bg-muted overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Sem imagem</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 h-10 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>{product.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg font-bold text-primary">{formatPrice(product.promotional_price || product.price)}</span>
                  </div>
                  {canAddToCart && (
                    <button onClick={() => handleAddToCart(product.id)} disabled={product.stock === 0} className="w-full py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1">
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
    </MainLayout>
  );
};

export default SearchPage;
