import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, errMsg } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BuyerProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", shipping_address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && typeof user === "object") {
      setForm({ name: user.name || "", phone: user.phone || "", shipping_address: user.shipping_address || "" });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/mp/auth/me", form);
      toast.success("Perfil atualizado");
      if (refresh) refresh();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-6" data-testid="buyer-profile">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Meu perfil</h1>
        <p className="mt-1 text-sm text-ink-500">Atualize os dados que aparecem no checkout e mensagens.</p>
      </div>
      <form onSubmit={save} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6">
        <div>
          <label className="text-sm font-medium">E-mail</label>
          <input value={user?.email || ""} readOnly
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-black/5 px-3 text-sm text-ink-500" />
        </div>
        <div>
          <label className="text-sm font-medium">Nome completo</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                 data-testid="buyer-profile-name" />
        </div>
        <div>
          <label className="text-sm font-medium">Telefone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                 placeholder="(11) 99999-0000"
                 className="mt-1 h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-brand-500"
                 data-testid="buyer-profile-phone" />
        </div>
        <div>
          <label className="text-sm font-medium">Endereço de entrega</label>
          <textarea rows="3" value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                    placeholder="Rua, número, complemento, cidade/estado, CEP"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white p-3 text-sm outline-none focus:border-brand-500"
                    data-testid="buyer-profile-address" />
        </div>
        <button type="submit" disabled={saving} data-testid="buyer-profile-save"
                className="w-full rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
