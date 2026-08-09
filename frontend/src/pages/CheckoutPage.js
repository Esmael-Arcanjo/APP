import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../services/api';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'BR',
  });

  const total = (cart.items || []).reduce((sum, item) => {
    const price = item.product?.promotional_price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderItems = cart.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product?.name || '',
        seller_id: item.product?.seller_id || '',
        quantity: item.quantity,
        unit_price: item.product?.promotional_price || item.product?.price || 0,
        total_price: (item.product?.promotional_price || item.product?.price || 0) * item.quantity,
      }));

      const { data: order } = await api.post('/orders', {
        items: orderItems,
        shipping_address: address,
        billing_address: address,
      });

      const { data: checkout } = await api.post(`/payments/checkout?order_id=${order.id}`);

      await clearCart();
      window.location.href = checkout.checkout_url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Erro ao processar checkout');
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Finalizar Compra
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Endereço"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    required
                    className="px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    required
                    className="px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <input
                  type="text"
                  placeholder="CEP / ZIP"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="checkout-submit-btn"
                  className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Continuar para Pagamento'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
            <div className="space-y-2 mb-4">
              {cart.items?.map((item) => (
                <div key={item.product_id} className="flex justify-between text-sm">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span>{formatPrice((item.product?.promotional_price || item.product?.price || 0) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
