import React, { useState, useEffect } from 'react';
import { Plus, Package, DollarSign, TrendingUp, X, Edit2, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import ImageUploader from '../components/ImageUploader';

const emptyProduct = {
  name: '',
  description: '',
  category_id: '',
  brand: '',
  sku: '',
  price: 0,
  promotional_price: null,
  stock: 0,
  weight: null,
  dimensions: { length: '', width: '', height: '', unit: 'cm' },
  images: [],
  colors: [],
  sizes: [],
  tags: [],
  attributes: [],
  product_type: 'physical',
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [product, setProduct] = useState(emptyProduct);
  const [productImages, setProductImages] = useState([]);
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        api.get('/products', { params: { seller_id: user.id, limit: 100 } }),
        api.get('/orders'),
        api.get('/categories'),
      ]);
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const openForm = (existing = null) => {
    if (existing) {
      setProduct({
        ...emptyProduct,
        ...existing,
        dimensions: existing.dimensions || { length: '', width: '', height: '', unit: 'cm' },
      });
      setProductImages(existing.images || []);
      setColorsInput((existing.colors || []).join(', '));
      setSizesInput((existing.sizes || []).join(', '));
      setTagsInput((existing.tags || []).join(', '));
      setEditingId(existing.id);
    } else {
      setProduct(emptyProduct);
      setProductImages([]);
      setColorsInput('');
      setSizesInput('');
      setTagsInput('');
      setEditingId(null);
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setProduct(emptyProduct);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...product,
        price: parseFloat(product.price) || 0,
        promotional_price: product.promotional_price ? parseFloat(product.promotional_price) : null,
        stock: parseInt(product.stock) || 0,
        weight: product.weight ? parseFloat(product.weight) : null,
        dimensions: {
          length: product.dimensions.length ? parseFloat(product.dimensions.length) : null,
          width: product.dimensions.width ? parseFloat(product.dimensions.width) : null,
          height: product.dimensions.height ? parseFloat(product.dimensions.height) : null,
          unit: product.dimensions.unit || 'cm',
        },
        images: productImages,
        colors: colorsInput.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: sizesInput.split(',').map((s) => s.trim()).filter(Boolean),
        tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        toast.success('Produto atualizado!');
      } else {
        await api.post('/products', payload);
        toast.success('Produto criado e enviado para aprovação!');
      }
      closeForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar produto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Produto excluído!');
      fetchData();
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const totalRevenue = orders.reduce((sum, order) => {
    if (order.payment_status !== 'paid') return sum;
    const sellerItems = order.items.filter((item) => item.seller_id === user?.id);
    return sum + sellerItems.reduce((s, i) => s + i.total_price, 0);
  }, 0);

  const tabs = [
    { id: 'products', label: 'Meus Produtos' },
    { id: 'orders', label: 'Pedidos' },
    { id: 'reports', label: 'Relatórios' },
  ];

  if (loading) {
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
      <div className="space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-4xl font-black" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>
            Painel do Vendedor
          </h1>
          <button data-testid="seller-add-product-btn" onClick={() => openForm()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Adicionar Produto
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <Package className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Meus Produtos</p>
            <p className="text-3xl font-bold">{products.length}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <TrendingUp className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Meus Pedidos</p>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-6">
            <DollarSign className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Receita</p>
            <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} data-testid={`seller-tab-${tab.id}`} className={`px-4 py-2 font-medium transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeForm} className="p-2 hover:bg-muted rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome do produto" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required className="px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
                <select value={product.category_id} onChange={(e) => setProduct({ ...product, category_id: e.target.value })} required className="px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Selecione a categoria</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                </select>
              </div>
              <textarea placeholder="Descrição detalhada" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} required rows="3" className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Marca" value={product.brand} onChange={(e) => setProduct({ ...product, brand: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border" />
                <input type="text" placeholder="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border" />
                <select value={product.product_type} onChange={(e) => setProduct({ ...product, product_type: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border">
                  <option value="physical">Físico</option>
                  <option value="digital">Digital</option>
                </select>
                <input type="number" placeholder="Estoque" value={product.stock} onChange={(e) => setProduct({ ...product, stock: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <input type="number" step="0.01" placeholder="Preço" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} required className="px-4 py-2 rounded-lg bg-background border border-border" />
                <input type="number" step="0.01" placeholder="Preço Promocional" value={product.promotional_price || ''} onChange={(e) => setProduct({ ...product, promotional_price: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border" />
                <input type="number" step="0.01" placeholder="Peso (kg)" value={product.weight || ''} onChange={(e) => setProduct({ ...product, weight: e.target.value })} className="px-4 py-2 rounded-lg bg-background border border-border" />
              </div>
              {product.product_type === 'physical' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Dimensões</label>
                  <div className="grid grid-cols-4 gap-2">
                    <input type="number" step="0.1" placeholder="Comprimento" value={product.dimensions.length} onChange={(e) => setProduct({ ...product, dimensions: { ...product.dimensions, length: e.target.value } })} className="px-4 py-2 rounded-lg bg-background border border-border text-sm" />
                    <input type="number" step="0.1" placeholder="Largura" value={product.dimensions.width} onChange={(e) => setProduct({ ...product, dimensions: { ...product.dimensions, width: e.target.value } })} className="px-4 py-2 rounded-lg bg-background border border-border text-sm" />
                    <input type="number" step="0.1" placeholder="Altura" value={product.dimensions.height} onChange={(e) => setProduct({ ...product, dimensions: { ...product.dimensions, height: e.target.value } })} className="px-4 py-2 rounded-lg bg-background border border-border text-sm" />
                    <select value={product.dimensions.unit} onChange={(e) => setProduct({ ...product, dimensions: { ...product.dimensions, unit: e.target.value } })} className="px-4 py-2 rounded-lg bg-background border border-border text-sm">
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="in">in</option>
                    </select>
                  </div>
                </div>
              )}
              <input type="text" placeholder="Cores (separadas por vírgula, ex: Preto, Branco, Vermelho)" value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-border" />
              <input type="text" placeholder="Tamanhos (separados por vírgula, ex: P, M, G, GG)" value={sizesInput} onChange={(e) => setSizesInput(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-border" />
              <input type="text" placeholder="Tags (separadas por vírgula, ex: novo, oferta)" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-background border border-border" />
              <div>
                <label className="block text-sm font-medium mb-2">Imagens do Produto</label>
                <ImageUploader value={productImages} onChange={setProductImages} multiple max={8} testId="product-images" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold">{editingId ? 'Atualizar' : 'Criar Produto'}</button>
                <button type="button" onClick={closeForm} className="px-6 py-2 rounded-full border border-border">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-2">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum produto ainda</p>
            ) : (
              products.map((prod) => (
                <div key={prod.id} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {prod.images?.[0] && <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate">{prod.name}</h3>
                    <p className="text-sm text-muted-foreground">Estoque: {prod.stock} | {prod.colors?.length || 0} cores | {prod.sizes?.length || 0} tamanhos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(prod.price)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${prod.approval_status === 'approved' ? 'bg-green-500/20 text-green-500' : prod.approval_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>
                      {prod.approval_status === 'approved' ? 'Aprovado' : prod.approval_status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openForm(prod)} data-testid={`seller-edit-${prod.id}`} className="p-2 hover:bg-muted rounded-full"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(prod.id)} data-testid={`seller-delete-${prod.id}`} className="p-2 hover:bg-muted rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-2">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum pedido ainda</p>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold">Pedido #{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${order.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4">Resumo Financeiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Pedidos Pagos</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.payment_status === 'paid').length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Produtos Aprovados</p>
                <p className="text-2xl font-bold">{products.filter(p => p.approval_status === 'approved').length}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-xl">
                <p className="text-sm text-muted-foreground">Produtos Pendentes</p>
                <p className="text-2xl font-bold">{products.filter(p => p.approval_status === 'pending').length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SellerDashboard;
