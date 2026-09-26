import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link2, MessageCircle, Instagram, Youtube, Music2, Globe, Store } from "lucide-react";
import { api } from "@/lib/api";
import { resolveImage } from "@/components/ImageUpload";

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

export default function PublicBio() {
  const { slug } = useParams();
  const [page, setPage] = useState(undefined);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get(`/public/bio/${slug}`);
        if (!alive) return;
        setPage(data);
        // Fire-and-forget page view.
        api.post(`/public/bio/${slug}/view`).catch(() => {});
      } catch { if (alive) setPage(null); }
    })();
    return () => { alive = false; };
  }, [slug]);

  const clickLink = (index) => {
    api.post(`/public/bio/${slug}/click/${index}`).catch(() => {});
  };

  if (page === undefined) {
    return <div className="flex min-h-screen items-center justify-center text-neutral-400">Carregando…</div>;
  }
  if (page === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-50 text-center">
        <p className="font-display text-2xl font-extrabold">Página não encontrada</p>
        <p className="text-sm text-neutral-500">Este link na bio não existe ou não está publicado.</p>
      </div>
    );
  }

  const accent = page.accent || "#F97316";
  const wa = (page.whatsapp || "").replace(/\D/g, "");
  const cover = resolveImage(page.cover_url);
  const avatar = resolveImage(page.avatar_url);

  return (
    <div data-testid="public-bio" className="min-h-screen bg-neutral-100 py-10">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="relative h-40">
          {cover
            ? <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
            : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)` }} />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="-mt-16 flex flex-col items-center px-6 pb-10 text-center">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-neutral-200 shadow-xl">
            {avatar
              ? <img src={avatar} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-neutral-400"><Link2 className="h-9 w-9" /></div>}
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-neutral-900">{page.display_name || "LEAMSE"}</h1>
          {page.headline && <p className="mt-1 text-sm font-semibold" style={{ color: accent }}>{page.headline}</p>}
          {page.bio && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-neutral-500">{page.bio}</p>}

          <div className="mt-6 w-full space-y-3">
            {(page.links || []).map((l, i) => {
              const Ico = LINK_ICONS[l.icon || iconFor(l.url)] || Link2;
              return (
                <a key={i} href={l.url} target="_blank" rel="noreferrer"
                   onClick={() => clickLink(i)}
                   data-testid={`public-link-${i}`}
                   className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <Ico className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                </a>
              );
            })}
            {wa && (
              <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" data-testid="public-whatsapp"
                 className="flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-90"
                 style={{ backgroundColor: accent, boxShadow: `0 12px 28px -8px ${accent}66` }}>
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </a>
            )}
          </div>

          <p className="mt-8 text-[11px] text-neutral-400">Feito com LEAMSE · leamse.com</p>
        </div>
      </div>
    </div>
  );
}
