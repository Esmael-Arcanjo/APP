import React, { useState, useEffect } from 'react';
import {
  Users, Package, ShoppingBag, DollarSign, AlertCircle, TrendingUp,
  Plus, Trash2, X, Ban, ShieldCheck, ImagePlus, Megaphone, Archive, CreditCard, Boxes, Edit2, Check, UserX,
} from 'lucide-react';
import api from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { toast } from 'sonner';
import MainLayout from '../layouts/MainLayout';
import ImageUploader from '../components/ImageUploader';

const AdminDashboard = () => {
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState(null);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', image_url: '' });
  const [newCatImages, setNewCatImages] = useState([]);
  const [bannerForm, setBannerForm] = useState({ open: false, id: null, title: '', subtitle: '', link_url: '', image_url: '', order: 0, is_active: true });
  const [bannerImages, setBannerImages] = useState([]);
  const [annForm, setAnnForm] = useState({ open: false, id: null, title: '', message: '', link_url: '', image_url: '', placement: 'home_top', is_active: true });
  const [annImages, setAnnImages] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, pp, u, c, o, ap, b, ann, pay, com, st] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/products/pending'),
        api.get('/admin/users'),
        api.get('/categories'),
        api.get('/orders'),
        api.get('/admin/products'),
        api.get('/banners/all'),
        api.get('/announcements/all'),
        api.get('/admin/payments'),
        api.get('/admin/commissions'),
        api.get('/admin/stock'),
      ]);
      setStats(s.data); setPendingProducts(pp.data); setUsers(u.data);
      setCategories(c.data); setOrders(o.data); setAllProducts(ap.data);
      setBanners(b.data); setAnnouncements(ann.data); setPayments(pay.data);
      setCommissions(com.data); setStockList(st.data);
    } catch (e) {
      toast.error('Erro ao carregar dados');
    } finally { setLoading(false); }
  };

  const handleApproveProduct = async (id, approved) => {
    try { await api.post(`/products/${id}/approve?approved=${approved}`); toast.success(`Produto ${approved ? 'aprovado' : 'rejeitado'}`); fetchData(); }
    catch { toast.error('Erro'); }
  };
  const handleApproveSeller = async (id, approved) => {
    try { await api.post(`/admin/sellers/${id}/approve?approved=${approved}`); toast.success(`Vendedor ${approved ? 'aprovado' : 'rejeitado'}`); fetchData(); }
    catch { toast.error('Erro'); }
  };
  const banUser = async (id, banned) => {
    if (!window.confirm(banned ? 'Banir usuário?' : 'Reativar usuário?')) return;
    try { await api.post(`/admin/users/${id}/ban?banned=${banned}`); toast.success('Feito'); fetchData(); }
    catch (e) { toast.error(e?.response?.data?.detail || 'Erro'); }
  };
  const deleteUser = async (id) => {
    if (!window.confirm('Excluir usuário definitivamente?')) return;
    try { await api.delete(`/admin/users/${id}`); toast.success('Usuário excluído'); fetchData(); }
    catch (e) { toast.error(e?.response?.data?.detail || 'Erro'); }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newCat, image_url: newCatImages[0] || newCat.image_url };
      await api.post('/categories/', payload);
      toast.success('Categoria criada!'); setNewCat({ name: '', description: '', image_url: '' }); setNewCatImages([]); setShowCatForm(false); fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Erro ao criar'); }
  };
  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Excluir categoria?')) return;
    try { await api.delete(`/categories/${id}`); toast.success('Excluída'); fetchData(); } catch { toast.error('Erro'); }
  };
  const deleteProduct = async (id) => {
    if (!window.confirm('Excluir produto?')) return;
    try { await api.delete(`/products/${id}`); toast.success('Produto excluído'); fetchData(); } catch { toast.error('Erro'); }
  };

  const saveBanner = async (e) => {
    e.preventDefault();
    const payload = { ...bannerForm, image_url: bannerImages[0] || bannerForm.image_url };
    delete payload.open; delete payload.id;
    try {
      if (bannerForm.id) await api.put(`/banners/${bannerForm.id}`, payload);
      else await api.post('/banners', payload);
      toast.success('Banner salvo'); setBannerForm({ open: false, id: null, title: '', subtitle: '', link_url: '', image_url: '', order: 0, is_active: true }); setBannerImages([]); fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Erro'); }
  };
  const deleteBanner = async (id) => {
    if (!window.confirm('Excluir banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Excluído'); fetchData(); } catch { toast.error('Erro'); }
  };

  const saveAnn = async (e) => {
    e.preventDefault();
    const payload = { ...annForm, image_url: annImages[0] || annForm.image_url };
    delete payload.open; delete payload.id;
    try {
      if (annForm.id) await api.put(`/announcements/${annForm.id}`, payload);
      else await api.post('/announcements', payload);
      toast.success('Anúncio salvo'); setAnnForm({ open: false, id: null, title: '', message: '', link_url: '', image_url: '', placement: 'home_top', is_active: true }); setAnnImages([]); fetchData();
    } catch (e) { toast.error(e.response?.data?.detail || 'Erro'); }
  };
  const deleteAnn = async (id) => {
    if (!window.confirm('Excluir anúncio?')) return;
    try { await api.delete(`/announcements/${id}`); toast.success('Excluído'); fetchData(); } catch { toast.error('Erro'); }
  };

  const generateCommissions = async () => {
    try { const { data } = await api.post('/admin/commissions/generate'); toast.success(`${data.created} comissões geradas`); fetchData(); }
    catch { toast.error('Erro ao gerar comissões'); }
  };
  const releaseCommission = async (id) => {
    try { await api.post(`/admin/commissions/${id}/release`); toast.success('Comissão liberada'); fetchData(); }
    catch { toast.error('Erro'); }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    </MainLayout>
  );

  const statCards = [
    { icon: Users, label: 'Total Usuários', value: stats?.total_users || 0, color: 'text-blue-500' },
    { icon: Package, label: 'Total Produtos', value: stats?.total_products || 0, color: 'text-green-500' },
    { icon: ShoppingBag, label: 'Total Pedidos', value: stats?.total_orders || 0, color: 'text-purple-500' },
    { icon: DollarSign, label: 'Receita Total', value: formatPrice(stats?.total_revenue || 0), color: 'text-yellow-500' },
    { icon: AlertCircle, label: 'Produtos Pendentes', value: stats?.pending_products || 0, color: 'text-red-500' },
    { icon: TrendingUp, label: 'Vendedores Pendentes', value: stats?.pending_sellers || 0, color: 'text-orange-500' },
    { icon: CreditCard, label: 'Comissão Plataforma', value: formatPrice(stats?.platform_commission || 0), color: 'text-emerald-500' },
    { icon: Users, label: 'Clientes', value: stats?.total_clients || 0, color: 'text-sky-500' },
    { icon: Users, label: 'Vendedores', value: stats?.total_sellers || 0, color: 'text-fuchsia-500' },
  ];

  const tabs = [
    { id: 'stats', label: 'Estatísticas', icon: TrendingUp },
    { id: 'products', label: 'Produtos Pendentes', icon: AlertCircle },
    { id: 'all-products', label: 'Todos Produtos', icon: Package },
    { id: 'stock', label: 'Estoque Geral', icon: Boxes },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'categories', label: 'Categorias', icon: Archive },
    { id: 'banners', label: 'Banners', icon: ImagePlus },
    { id: 'ads', label: 'Anúncios', icon: Megaphone },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'commissions', label: 'Comissões', icon: DollarSign },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'Cabinet Grotesk, sans-serif' }}>Dashboard Admin</h1>
        </div>

        {/* Tabs - horizontally scrollable */}
        <div className="flex gap-1 border-b border-border overflow-x-auto pb-1 -mx-2 px-2">
          {tabs.map((t) => (
            <button key={t.id} data-testid={`admin-tab-${t.id}`} onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors ${activeTab === t.id ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-2xl md:text-3xl font-bold">{s.value}</p>
                  </div>
                  <s.icon className={`w-7 h-7 ${s.color}`} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-3">
            {pendingProducts.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhum produto pendente</p> : (
              pendingProducts.map((p) => (
                <div key={p.id} className="bg-surface border border-border rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">Vendedor: <span className="font-medium">{p.seller?.name || '-'}</span> · {p.seller?.email}</p>
                      <p className="text-primary font-bold mt-1">{formatPrice(p.price)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApproveProduct(p.id, true)} data-testid={`approve-product-${p.id}`} className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm">Aprovar</button>
                    <button onClick={() => handleApproveProduct(p.id, false)} className="px-3 py-1.5 rounded-full bg-red-500 text-white text-sm">Rejeitar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'all-products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Produto</th><th className="p-2">Vendedor</th><th className="p-2">Preço</th><th className="p-2">Estoque</th><th className="p-2">Status</th><th className="p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {allProducts.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                    <td className="p-2 flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded bg-muted overflow-hidden flex-shrink-0">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="truncate max-w-[220px]">{p.name}</span>
                    </td>
                    <td className="p-2 whitespace-nowrap"><div className="font-medium">{p.seller?.name}</div><div className="text-xs text-muted-foreground">{p.seller?.email}</div></td>
                    <td className="p-2 whitespace-nowrap text-primary font-semibold">{formatPrice(p.price)}</td>
                    <td className="p-2 whitespace-nowrap">{p.stock}</td>
                    <td className="p-2 whitespace-nowrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.approval_status === 'approved' ? 'bg-green-500/20 text-green-500' : p.approval_status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{p.approval_status}</span>
                    </td>
                    <td className="p-2 whitespace-nowrap flex gap-1">
                      {p.approval_status !== 'approved' && <button onClick={() => handleApproveProduct(p.id, true)} className="p-1 rounded hover:bg-muted"><Check className="w-4 h-4 text-green-500" /></button>}
                      <button onClick={() => deleteProduct(p.id)} data-testid={`admin-delete-product-${p.id}`} className="p-1 rounded hover:bg-muted"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="p-2">Produto</th><th className="p-2">Vendedor</th><th className="p-2">Preço</th><th className="p-2">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {stockList.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.seller?.name}<br /><span className="text-xs text-muted-foreground">{p.seller?.email}</span></td>
                    <td className="p-2 text-primary">{formatPrice(p.price)}</td>
                    <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs ${p.stock === 0 ? 'bg-red-500/20 text-red-500' : p.stock < 5 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>{p.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="bg-surface border border-border rounded-xl p-3 grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                <div className="min-w-0">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-primary text-primary-foreground' : u.role === 'seller' ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>{u.role}</span>
                  {u.role === 'seller' && <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_approved ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{u.is_approved ? 'Aprovado' : 'Pendente'}</span>}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{u.is_active ? 'Ativo' : 'Banido'}</span>
                </div>
                <div className="text-xs text-muted-foreground">Criado: {new Date(u.created_at).toLocaleDateString('pt-BR')}</div>
                <div className="flex flex-wrap gap-1 md:col-span-2">
                  {u.role === 'seller' && !u.is_approved && (
                    <>
                      <button onClick={() => handleApproveSeller(u.id, true)} className="px-2 py-1 rounded-full bg-green-500 text-white text-xs">Aprovar</button>
                      <button onClick={() => handleApproveSeller(u.id, false)} className="px-2 py-1 rounded-full bg-red-500 text-white text-xs">Rejeitar</button>
                    </>
                  )}
                  {u.role !== 'admin' && (
                    <>
                      {u.is_active ? (
                        <button onClick={() => banUser(u.id, true)} data-testid={`admin-ban-${u.id}`} className="px-2 py-1 rounded-full bg-yellow-600 text-white text-xs flex items-center gap-1"><Ban className="w-3 h-3" />Banir</button>
                      ) : (
                        <button onClick={() => banUser(u.id, false)} className="px-2 py-1 rounded-full bg-emerald-600 text-white text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Reativar</button>
                      )}
                      <button onClick={() => deleteUser(u.id)} data-testid={`admin-delete-user-${u.id}`} className="px-2 py-1 rounded-full bg-red-600 text-white text-xs flex items-center gap-1"><UserX className="w-3 h-3" />Excluir</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setShowCatForm(!showCatForm)} data-testid="admin-add-category" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm"><Plus className="w-4 h-4" />Nova Categoria</button>
            </div>
            {showCatForm && (
              <form onSubmit={handleCreateCategory} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
                <input type="text" placeholder="Nome" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} required className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
                <input type="text" placeholder="Descrição" value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
                <ImageUploader value={newCatImages} onChange={setNewCatImages} multiple={false} max={1} testId="cat-image-uploader" />
                <button type="submit" className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm">Criar</button>
              </form>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {c.image_url && <img src={c.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-2 flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{c.name}</span>
                    <button onClick={() => handleDeleteCategory(c.id)} className="p-1 hover:bg-muted rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setBannerForm({ ...bannerForm, open: true, id: null, title: '', subtitle: '', link_url: '', image_url: '', order: 0, is_active: true })} data-testid="admin-add-banner" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm"><Plus className="w-4 h-4" />Novo Banner</button>
            </div>
            {bannerForm.open && (
              <form onSubmit={saveBanner} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Título" required value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border" />
                  <input placeholder="Subtítulo" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border" />
                  <input placeholder="Link (opcional)" value={bannerForm.link_url} onChange={(e) => setBannerForm({ ...bannerForm, link_url: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border" />
                  <input type="number" placeholder="Ordem" value={bannerForm.order} onChange={(e) => setBannerForm({ ...bannerForm, order: parseInt(e.target.value) || 0 })} className="px-3 py-2 rounded-lg bg-background border border-border" />
                </div>
                <ImageUploader value={bannerImages.length ? bannerImages : (bannerForm.image_url ? [bannerForm.image_url] : [])} onChange={setBannerImages} multiple={false} max={1} testId="banner-image-uploader" />
                <div className="flex gap-2">
                  <button type="submit" className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Salvar</button>
                  <button type="button" onClick={() => setBannerForm({ ...bannerForm, open: false })} className="px-6 py-2 rounded-full border border-border text-sm">Cancelar</button>
                </div>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {banners.map((b) => (
                <div key={b.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <div className="aspect-[3/1] bg-muted overflow-hidden">
                    {b.image_url && <img src={b.image_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{b.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setBannerImages(b.image_url ? [b.image_url] : []); setBannerForm({ open: true, id: b.id, title: b.title, subtitle: b.subtitle || '', link_url: b.link_url || '', image_url: b.image_url, order: b.order || 0, is_active: b.is_active }); }} className="p-1 hover:bg-muted rounded"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteBanner(b.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setAnnForm({ ...annForm, open: true, id: null, title: '', message: '', link_url: '', image_url: '', placement: 'home_top', is_active: true })} data-testid="admin-add-ad" className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm"><Plus className="w-4 h-4" />Novo Anúncio</button>
            </div>
            {annForm.open && (
              <form onSubmit={saveAnn} className="bg-surface border border-border rounded-2xl p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Título" required value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border" />
                  <select value={annForm.placement} onChange={(e) => setAnnForm({ ...annForm, placement: e.target.value })} className="px-3 py-2 rounded-lg bg-background border border-border">
                    <option value="home_top">Home Topo</option>
                    <option value="home_sidebar">Home Sidebar</option>
                    <option value="product_page">Página de Produto</option>
                    <option value="global_banner">Banner Global</option>
                  </select>
                </div>
                <textarea placeholder="Mensagem" required rows="3" value={annForm.message} onChange={(e) => setAnnForm({ ...annForm, message: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
                <input placeholder="Link (opcional)" value={annForm.link_url} onChange={(e) => setAnnForm({ ...annForm, link_url: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-background border border-border" />
                <ImageUploader value={annImages.length ? annImages : (annForm.image_url ? [annForm.image_url] : [])} onChange={setAnnImages} multiple={false} max={1} testId="ad-image-uploader" />
                <div className="flex gap-2">
                  <button type="submit" className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">Salvar</button>
                  <button type="button" onClick={() => setAnnForm({ ...annForm, open: false })} className="px-6 py-2 rounded-full border border-border text-sm">Cancelar</button>
                </div>
              </form>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {announcements.map((a) => (
                <div key={a.id} className="bg-surface border border-border rounded-2xl overflow-hidden">
                  {a.image_url && <div className="aspect-[3/1] bg-muted overflow-hidden"><img src={a.image_url} alt="" className="w-full h-full object-cover" /></div>}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-bold truncate">{a.title}</p>
                      <div className="flex gap-1">
                        <button onClick={() => { setAnnImages(a.image_url ? [a.image_url] : []); setAnnForm({ open: true, id: a.id, title: a.title, message: a.message, link_url: a.link_url || '', image_url: a.image_url || '', placement: a.placement || 'home_top', is_active: a.is_active }); }} className="p-1 hover:bg-muted rounded"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deleteAnn(a.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2">Local: {a.placement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-2">
            {orders.length === 0 ? <p className="text-muted-foreground text-center py-8">Nenhum pedido</p> : (
              orders.map((o) => (
                <div key={o.id} className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold">#{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString('pt-BR')} · {o.items?.length || 0} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatPrice(o.total)}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${o.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{o.payment_status === 'paid' ? 'Pago' : 'Pendente'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border"><tr className="text-left text-muted-foreground"><th className="p-2">Session</th><th className="p-2">Pedido</th><th className="p-2">Valor</th><th className="p-2">Moeda</th><th className="p-2">Status</th><th className="p-2">Criado</th></tr></thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id || p.session_id} className="border-b border-border">
                    <td className="p-2 font-mono text-xs truncate max-w-[180px]">{p.session_id}</td>
                    <td className="p-2 text-xs">{p.order_id}</td>
                    <td className="p-2 text-primary font-semibold">{formatPrice(p.amount || 0)}</td>
                    <td className="p-2 uppercase text-xs">{p.currency}</td>
                    <td className="p-2"><span className={`text-[10px] px-2 py-0.5 rounded-full ${p.payment_status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{p.payment_status}</span></td>
                    <td className="p-2 text-xs">{p.created_at ? new Date(p.created_at).toLocaleString('pt-BR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={generateCommissions} data-testid="admin-generate-commissions" className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm">Gerar Comissões dos Pedidos Pagos</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border"><tr className="text-left text-muted-foreground"><th className="p-2">Pedido</th><th className="p-2">Vendedor</th><th className="p-2">Bruto</th><th className="p-2">Comissão</th><th className="p-2">Payout</th><th className="p-2">Status</th><th className="p-2">Ações</th></tr></thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} className="border-b border-border">
                      <td className="p-2 text-xs">#{c.order_number}</td>
                      <td className="p-2 text-xs">{c.seller_id?.slice(-6)}</td>
                      <td className="p-2">{formatPrice(c.gross_amount || 0)}</td>
                      <td className="p-2 text-red-500">{formatPrice(c.commission_amount || 0)}</td>
                      <td className="p-2 text-green-500">{formatPrice(c.payout_amount || 0)}</td>
                      <td className="p-2"><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'released' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{c.status}</span></td>
                      <td className="p-2">
                        {c.status === 'pending' && <button onClick={() => releaseCommission(c.id)} data-testid={`release-commission-${c.id}`} className="px-2 py-1 rounded-full bg-green-500 text-white text-xs">Liberar</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
