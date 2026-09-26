import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SellerProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ store_name: "", bio: "", banner_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && typeof user === "object") {
      setForm({ store_name: user.store_name || "", bio: user.bio || "", banner_url: user.banner_url || "" });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/mp/seller/profile", form);
      toast.success("Perfil da loja atualizado");
      if (refresh) refresh();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6" data-testid="seller-profile">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Perfil da loja</h1>
        <p className="mt-1 text-sm text-ink-500">Como sua loja aparece na página pública.</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6">
        <div>
          <label className="text-sm font-medium">Nome da loja</label>
          <input required value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                 data-testid="seller-profile-name" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Fale sobre sua loja, região de entrega, política de troca…"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-brand-500"
                    data-testid="seller-profile-bio" />
        </div>
        <div>
          <label className="text-sm font-medium">Banner (URL)</label>
          <input value={form.banner_url} onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                 placeholder="https://…"
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                 data-testid="seller-profile-banner" />
          {form.banner_url && (
            <img src={form.banner_url} alt="" className="mt-3 h-32 w-full rounded-xl object-cover" />
          )}
          <p className="mt-1 text-xs text-ink-500">Cloudinary será conectado assim que suas chaves forem cadastradas.</p>
        </div>
        <button type="submit" disabled={saving} data-testid="seller-profile-save"
                className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
