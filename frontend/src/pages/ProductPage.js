import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const canAddToCart = !user || user?.role === 'client';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      const { data: reviewsData } = await api.get(`/reviews/product/${id}`);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(id, quantity);
      toast.success('Produto adicionado ao carrinho!');
    } catch (error) {
      toast.error('Erro ao adicionar ao carrinho');
    }
  };

  if (loading || !product) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
            {product.images && product.images[selectedImage] ? (
              <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">Sem imagem</div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
              {product.name}
            </h1>
            {product.average_rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.total_reviews} avaliações)</span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            {product.promotional_price ? (
              <>
                <span className="text-4xl font-black text-primary">{formatPrice(product.promotional_price)}</span>
                <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-4xl font-black text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">Cor:</label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    data-testid={`color-${color}`}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors ${selectedColor === color ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">Tamanho:</label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    data-testid={`size-${size}`}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors min-w-12 ${selectedSize === size ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-l-full">-</button>
              <span className="w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted rounded-r-full">+</button>
            </div>
            {canAddToCart ? (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho'}
              </button>
            ) : (
              <div className="flex-1 py-3 rounded-full bg-muted text-muted-foreground font-semibold text-center">
                Apenas clientes podem comprar
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1 border-t border-border pt-4">
            {product.stock > 0 && <p>{product.stock} unidades disponíveis</p>}
            {product.brand && <p>Marca: {product.brand}</p>}
            {product.sku && <p>SKU: {product.sku}</p>}
            {product.weight && <p>Peso: {product.weight} kg</p>}
            {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height) && (
              <p>Dimensões: {product.dimensions.length || '-'} x {product.dimensions.width || '-'} x {product.dimensions.height || '-'} {product.dimensions.unit || 'cm'}</p>
            )}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Avaliações</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.user_name}</p>
                    {review.is_verified_purchase && <span className="text-xs text-primary">Compra Verificada</span>}
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ProductPage;
