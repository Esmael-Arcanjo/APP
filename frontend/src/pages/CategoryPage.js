import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Search } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import { PRODUCT } from '../constants/testIds';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const canAddToCart = !user || user?.role === 'client';

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [slug]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts(allProducts);
    } else {
      setProducts(allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())));
    }
  }, [searchQuery, allProducts]);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      const { data: categories } = await api.get('/categories');
      const cat = categories.find((c) => c.slug === slug);
      if (!cat) {
        toast.error('Categoria não encontrada');
        return;
      }
      setCategory(cat);
      const { data } = await api.get('/products', { params: { category_id: cat.id } });
      setAllProducts(data.products || []);
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
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

  return (
    <MainLayout>
      <div className="space-y-8">
        {category && (
          <div>
            <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              {category.name}
            </h1>
            {category.description && <p className="text-muted-foreground text-lg mb-4">{category.description}</p>}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                data-testid={PRODUCT.card}
                className="bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary transition-all group"
              >
                <div className="h-56 bg-muted overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.images && product.images[0] ? (
                    <img data-testid={PRODUCT.image} src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 data-testid={PRODUCT.name} className="font-bold text-lg mb-2 line-clamp-2 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    {product.promotional_price ? (
                      <>
                        <span data-testid={PRODUCT.price} className="text-2xl font-bold text-primary">{formatPrice(product.promotional_price)}</span>
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span data-testid={PRODUCT.price} className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                    )}
                  </div>
                  <button
                    data-testid={PRODUCT.addToCartButton}
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0 || !canAddToCart}
                    className={`w-full py-2 rounded-full ${canAddToCart ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'} font-medium transition-opacity disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {!canAddToCart ? 'Apenas Clientes' : product.stock === 0 ? 'Sem Estoque' : 'Adicionar'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
