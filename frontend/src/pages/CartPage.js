import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import { CART } from '../constants/testIds';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateCartItem, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();

  const total = (cart.items || []).reduce((sum, item) => {
    const price = item.product?.promotional_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error('Erro ao atualizar carrinho');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removido do carrinho');
    } catch (error) {
      toast.error('Erro ao remover item');
    }
  };

  const handleCheckout = () => {
    if (!cart.items || cart.items.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }
    navigate('/checkout');
  };

  return (
    <MainLayout>
      <div data-testid={CART.container} className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Carrinho
        </h1>

        {!cart.items || cart.items.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product_id} data-testid={CART.item} className="flex gap-4 p-4 bg-surface border border-border rounded-2xl">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    <p className="text-primary font-bold mt-1">{formatPrice(item.product?.promotional_price || item.product?.price || 0)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-border rounded-full">
                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-l-full">-</button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-r-full">+</button>
                      </div>
                    </div>
                  </div>
                  <button data-testid={CART.removeButton} onClick={() => handleRemove(item.product_id)} className="p-2 hover:bg-muted rounded-full self-start">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-4">Resumo</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span>Grátis</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span data-testid={CART.totalPrice} className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
              <button data-testid={CART.checkoutButton} onClick={handleCheckout} className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                Finalizar Compra
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CartPage;
