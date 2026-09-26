import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Link2, Plus, Trash2, MessageCircle, Instagram, Youtube, Music2, Globe, Store, Eye, MousePointerClick } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload, resolveImage } from "@/components/ImageUpload";
import { api, errMsg } from "@/lib/api";

const ACCENTS = [
  { c: "#F97316", name: "Laranja" },
  { c: "#EF4444", name: "Vermelho" },
  { c: "#8B5CF6", name: "Roxo" },
  { c: "#10B981", name: "Verde" },
  { c: "#0EA5E9", name: "Azul" },
  { c: "#EC4899", name: "Rosa" },
  { c: "#F59E0B", name: "Âmbar" },
  { c: "#18181B", name: "Preto" },
];

const LINK_ICONS = {
  instagram: Instagram, youtube: Youtube, tiktok: Music2, music: Music2,
  whatsapp: MessageCircle, shop: Store, site: Globe, link: Link2,
};

function iconFor(url) {
  const u = (url || "").toLowerCase();
  if (u.includes("instagram")) return "instagram";
  if (u.includes("youtube") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok")) return "tiktok";
  if (u.includes("spotify") || u.includes("music.apple")) return "music";
  if (u.includes("wa.me") || u.includes("whatsapp")) return "whatsapp";
  return "link";
}

export default function LinkBio() {
  const [page, setPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  const load = useCallback(async () => {
    try {
      const [pg, an] = await Promise.all([api.get("/dashboard/linkbio"), api.get("/dashboard/linkbio/analytics")]);
      setPage({ links: [], products: [], ...pg.data });
      setAnalytics(an.data);
    } catch (e) { toast.error(errMsg(e)); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!page) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  const set = (k, v) => setPage((p) => ({ ...p, [k]: v }));
  const setLink = (i, k, v) => setPage((p) => ({ ...p, links: p.links.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)) }));
  const addLink = () => setPage((p) => ({ ...p, links: [...(p.links || []), { label: "", url: "", icon: "link" }] }));
  const delLink = (i) => setPage((p) => ({ ...p, links: p.links.filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        slug: page.slug, display_name: page.display_name, headline: page.headline, bio: page.bio,
        avatar_url: page.avatar_url, cover_url: page.cover_url,
        accent: page.accent, whatsapp: page.whatsapp, published: page.published,
        links: (page.links || []).filter((l) => l.label && l.url)
          .map((l) => ({ ...l, icon: l.icon || iconFor(l.url) })),
      };
      const { data } = await api.patch("/dashboard/linkbio", payload);
      setPage({ links: [], products: [], ...data });
      toast.success("Página salva");
    } catch (e) { toast.error(errMsg(e)); }
    finally { setSaving(false); }
  };

  const publicUrl = `${window.location.origin}/bio/${page.slug}`;
  const accent = page.accent || "#F97316";

  return (
    <div className="space-y-8">
      <PageHeader
        testId="linkbio-header"
        title="Link na Bio"
        subtitle="Uma página profissional que apresenta seu negócio e converte visitantes em contato."
        actions={
          <>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <a href={publicUrl} target="_blank" rel="noreferrer" data-testid="open-public-bio"><ExternalLink className="me-1.5 h-4 w-4" /> Ver página</a>
            </Button>
            <Button data-testid="save-bio-btn" size="sm" className="rounded-full" onClick={save} disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Editor */}
        <div className="space-y-6 lg:col-span-7">
          {analytics && (
            <section className="ls-card p-6" data-testid="bio-analytics">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-semibold md:text-lg">Analytics</h2>
                <p className="text-xs text-muted-foreground">Últimos 14 dias</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" /> Visitas totais
                  </div>
                  <p className="mt-1 font-display text-2xl font-extrabold">{analytics.total_views || 0}</p>
                </div>
                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                    <MousePointerClick className="h-3.5 w-3.5" /> Cliques em links
                  </div>
                  <p className="mt-1 font-display text-2xl font-extrabold">{analytics.total_clicks || 0}</p>
                </div>
              </div>
              <div className="mt-4 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.series || []}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="views" stroke={page.accent || "#F97316"} strokeWidth={2.5} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {(analytics.top_links || []).length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase text-muted-foreground">Links mais clicados</p>
                  <ul className="mt-2 divide-y divide-border">
                    {analytics.top_links.map((l, i) => (
                      <li key={i} className="flex items-center justify-between py-2 text-sm">
                        <span className="truncate">{l.label}</span>
                        <span className="ms-3 font-semibold">{l.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
          <section className="ls-card space-y-5 p-6">
            <h2 className="font-display text-base font-semibold md:text-lg">Identidade visual</h2>
            <div className="grid gap-5 sm:grid-cols-[1fr,2fr]">
              <div className="space-y-2">
                <Label>Foto de perfil</Label>
                <ImageUpload value={page.avatar_url} onChange={(v) => set("avatar_url", v)}
                             label="Enviar foto" aspect="square" testId="bio-avatar" />
              </div>
              <div className="space-y-2">
                <Label>Foto de capa</Label>
                <ImageUpload value={page.cover_url} onChange={(v) => set("cover_url", v)}
                             label="Enviar capa" aspect="cover" testId="bio-cover" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome de exibição</Label>
                <Input data-testid="bio-name" value={page.display_name || ""} onChange={(e) => set("display_name", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input data-testid="bio-slug" value={page.slug || ""} onChange={(e) => set("slug", e.target.value)} className="rounded-xl font-mono text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Chamada (headline)</Label>
              <Input data-testid="bio-headline" value={page.headline || ""} onChange={(e) => set("headline", e.target.value)}
                     placeholder="Ex: Consultora de imóveis · Curitiba/PR" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea data-testid="bio-text" rows={3} value={page.bio || ""} onChange={(e) => set("bio", e.target.value)}
                        placeholder="Fale um pouco sobre você e o que oferece" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp (com DDI)</Label>
              <Input data-testid="bio-whatsapp" value={page.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} placeholder="5511999999999" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Domínio próprio (opcional)</Label>
              <Input data-testid="bio-domain" value={page.custom_domain || ""} onChange={(e) => set("custom_domain", e.target.value)} placeholder="meusite.com" className="rounded-xl font-mono text-sm" />
              <p className="text-xs text-muted-foreground">
                Aponte o CNAME <code className="font-mono">bio.leamse.com</code> no seu DNS e informe o domínio aqui.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Cor de destaque</Label>
              <div className="flex flex-wrap gap-2">
                {ACCENTS.map((a) => (
                  <button key={a.c} data-testid={`bio-accent-${a.c}`} onClick={() => set("accent", a.c)}
                          aria-label={a.name}
                          className={`h-9 w-9 rounded-full ring-offset-2 transition ${page.accent === a.c ? "ring-2 ring-foreground scale-110" : ""}`}
                          style={{ backgroundColor: a.c }} />
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between rounded-xl ls-surface px-4 py-3">
              <div>
                <p className="text-sm font-medium">Página publicada</p>
                <p className="text-xs text-muted-foreground">Quando desligado, o link fica oculto</p>
              </div>
              <Switch data-testid="bio-published" checked={!!page.published} onCheckedChange={(v) => set("published", v)} />
            </label>
          </section>

          <section className="ls-card space-y-3 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold md:text-lg">Links</h2>
              <Button data-testid="add-link-btn" size="sm" variant="outline" className="rounded-full" onClick={addLink}>
                <Plus className="me-1 h-4 w-4" /> Adicionar
              </Button>
            </div>
            {(page.links || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhum link ainda. Adicione seu Instagram, YouTube, loja, catálogo…
              </p>
            )}
            {(page.links || []).map((l, i) => (
              <div key={i} data-testid={`bio-link-${i}`} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                <Input data-testid={`link-label-${i}`} placeholder="Rótulo (ex: Instagram)" value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} className="rounded-xl" />
                <Input data-testid={`link-url-${i}`} placeholder="https://…" value={l.url}
                       onChange={(e) => setLink(i, "url", e.target.value)} className="rounded-xl" />
                <Button data-testid={`link-del-${i}`} size="icon" variant="ghost" className="rounded-full text-destructive" onClick={() => delLink(i)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </section>
        </div>

        {/* Live phone preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <p className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">Prévia em tempo real</p>
            <div data-testid="bio-preview"
                 className="mx-auto max-w-[340px] overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-neutral-950">
              {/* Cover */}
              <div className="relative h-32">
                {page.cover_url
                  ? <img src={resolveImage(page.cover_url)} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)` }} />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div className="-mt-14 flex flex-col items-center px-6 pb-8 text-center">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-neutral-200 shadow-lg dark:border-neutral-950">
                  {page.avatar_url
                    ? <img src={resolveImage(page.avatar_url)} alt="" className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-neutral-400"><Link2 className="h-8 w-8" /></div>}
                </div>
                <h3 className="mt-4 font-display text-xl font-extrabold text-neutral-900 dark:text-white">
                  {page.display_name || "Seu nome"}
                </h3>
                {page.headline && (
                  <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>{page.headline}</p>
                )}
                {page.bio && (
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">{page.bio}</p>
                )}
                <div className="mt-6 w-full space-y-2.5">
                  {(page.links || []).filter((l) => l.label).map((l, i) => {
                    const Ico = LINK_ICONS[l.icon || iconFor(l.url)] || Link2;
                    return (
                      <div key={i} className="group flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                        <Ico className="h-4 w-4 shrink-0" style={{ color: accent }} />
                        <span className="min-w-0 flex-1 truncate">{l.label}</span>
                      </div>
                    );
                  })}
                  {page.whatsapp && (
                    <div className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-lg"
                         style={{ backgroundColor: accent, boxShadow: `0 10px 24px -8px ${accent}88` }}>
                      <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                    </div>
                  )}
                </div>
                <p className="mt-8 text-[10px] text-neutral-400">Feito com LEAMSE · leamse.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
