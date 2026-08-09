import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import MainLayout from '../layouts/MainLayout';
import { Heart, Package, User as UserIcon } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, favoritesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/favorites'),
      ]);
      setOrders(ordersRes.data || []);
      setFavorites(favoritesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    }
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: UserIcon },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-4xl font-black" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
          Meu Perfil
        </h1>

        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`profile-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Nome</label>
              <p className="font-semibold">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tipo de Conta</label>
              <p className="font-semibold capitalize">{user?.role}</p>
            </div>
            {user?.phone && (
              <div>
                <label className="text-sm text-muted-foreground">Telefone</label>
                <p className="font-semibold">{user.phone}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum pedido ainda</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-surface border border-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold">Pedido #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.length === 0 ? (
              <p className="col-span-full text-muted-foreground text-center py-8">Nenhum favorito ainda</p>
            ) : (
              favorites.map((product) => (
                <div key={product.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <div className="h-40 bg-muted overflow-hidden">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-primary font-bold mt-1">{formatPrice(product.price)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
