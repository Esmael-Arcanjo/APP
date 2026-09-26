import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Package } from "lucide-react";
import { api, errMsg, money } from "@/lib/api";

const empty = {
  name: "", description: "", price_cents: 0, currency: "BRL",
  image_url: "", images: [], stock: 1, category: "",
  sizes: "", colors: "",
};

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const { data } = await api.get("/mp/seller/products"); setProducts(data); }
    catch (e) { toast.error(errMsg(e)); }
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_cents: Number(form.price_cents),
        stock: Number(form.stock),
        images: form.images.filter(Boolean),
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (!payload.image_url && payload.images.length) payload.image_url = payload.images[0];
      await api.post("/mp/seller/products", payload);
      toast.success("Produto publicado");
      setForm(empty); load();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Excluir produto?")) return;
    try { await api.delete(`/mp/seller/products/${id}`); load(); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const setImage = (i, v) => {
    const list = [...form.images]; list[i] = v; setForm({ ...form, images: list });
  };
  const addImage = () => setForm({ ...form, images: [...form.images, ""] });
  const removeImage = (i) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-6" data-testid="seller-products">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Produtos</h1>
        <p className="mt-1 text-sm text-ink-500">Cadastre até 10 fotos, tamanhos, cores e descrição detalhada.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
        <form onSubmit={create} className="h-fit rounded-2xl border border-black/5 bg-white p-5" data-testid="new-product-form">
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Plus className="h-4 w-4 text-brand-500" /> Novo produto
          </h3>
          <div className="mt-4 space-y-3">
            <div><label className="text-xs font-medium">Nome</label>
              <input required value={form.name} onChange={set("name")} data-testid="prod-name"
                     className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
            <div><label className="text-xs font-medium">Descrição</label>
              <textarea rows="4" value={form.description} onChange={set("description")} data-testid="prod-desc"
                        placeholder="Detalhes, materiais, cuidados…"
                        className="mt-1 w-full rounded-lg border border-black/10 p-3 text-sm outline-none focus:border-brand-500" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">Preço (centavos)</label>
                <input type="number" required min="1" value={form.price_cents} onChange={set("price_cents")} data-testid="prod-price"
                       className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
              <div><label className="text-xs font-medium">Estoque</label>
                <input type="number" required min="0" value={form.stock} onChange={set("stock")} data-testid="prod-stock"
                       className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
            </div>
            <div><label className="text-xs font-medium">Categoria</label>
              <input value={form.category} onChange={set("category")} placeholder="Ex: Moda Feminina"
                     className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
            <div><label className="text-xs font-medium">Tamanhos (separe por vírgula)</label>
              <input value={form.sizes} onChange={set("sizes")} placeholder="PP, P, M, G, GG"
                     className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
            <div><label className="text-xs font-medium">Cores (separe por vírgula)</label>
              <input value={form.colors} onChange={set("colors")} placeholder="Preto, Branco, Azul"
                     className="mt-1 h-10 w-full rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-brand-500" /></div>
            <div>
              <label className="text-xs font-medium">Fotos (até 10 URLs)</label>
              <p className="text-[10px] text-ink-500">Cloudinary será conectado assim que suas chaves forem cadastradas.</p>
              <div className="mt-2 space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={img} onChange={(e) => setImage(i, e.target.value)}
                           placeholder={`https://…/foto-${i+1}.jpg`}
                           className="h-9 flex-1 rounded-lg border border-black/10 px-3 text-xs outline-none focus:border-brand-500" />
                    <button type="button" onClick={() => removeImage(i)}
                            className="grid h-9 w-9 place-items-center rounded-full text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {form.images.length < 10 && (
                  <button type="button" onClick={addImage} data-testid="add-image-btn"
                          className="inline-flex items-center gap-1 rounded-full border border-dashed border-black/15 px-3 py-1.5 text-xs font-medium hover:border-brand-500">
                    <Plus className="h-3 w-3" /> Adicionar foto ({form.images.length}/10)
                  </button>
                )}
              </div>
            </div>
            <button type="submit" disabled={saving} data-testid="prod-submit"
                    className="w-full rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              {saving ? "Publicando…" : "Publicar produto"}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-ink-500">
              <Package className="mx-auto mb-2 h-6 w-6 text-brand-500" />
              Nenhum produto ainda. Publique o primeiro à esquerda.
            </p>
          ) : products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4" data-testid={`sp-${p.id}`}>
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-50">
                {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{p.name}</p>
                <p className="text-xs text-ink-500">{p.category || "Sem categoria"} · Estoque: {p.stock}</p>
              </div>
              <p className="font-display font-extrabold text-brand-600">{money(p.price_cents, p.currency)}</p>
              <button onClick={() => remove(p.id)} className="grid h-9 w-9 place-items-center text-red-500 hover:bg-red-50 rounded-full"
                      data-testid={`sp-del-${p.id}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
