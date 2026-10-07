import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, onWaking, type ResultKind } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

const IS_DEMO = import.meta.env.VITE_IS_DEMO === "true";

export function Shell({ children }: { children: ReactNode }) {
  const { t, mx, lang, setLang } = useI18n();
  const [waking, setWaking] = useState(false);
  useEffect(() => onWaking(setWaking), []);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const health = useQuery({ queryKey: ["mx-health", lang], queryFn: () => apiGet<{ disclaimer: string }>(`/mx/health?lang=${lang}`), staleTime: Infinity });
  const stored = useDisclaimer();
  const disclaimer = (stored?.lang === lang ? stored.text : undefined) ?? health.data?.disclaimer ?? mx.common.disclaimer;
  const nav = "px-3 py-2 rounded-md text-primary-foreground/85 hover:bg-primary-foreground/10";
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-background">{mx.common.skipToContent}</a>
      {IS_DEMO && (
        <div role="status" className="bg-amber-50 border-b border-amber-200 text-amber-800">
          <div className="mx-auto max-w-5xl px-4 py-1.5 text-xs text-center">
            🚧 Demo — datos reales CDMX + Federal. Producción incluirá los 11 estados verificados.
          </div>
        </div>
      )}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-4 justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-serif text-xl font-bold tracking-tight text-primary transition-opacity hover:opacity-90">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm font-sans font-black text-base">
              R
            </span>
            <span>{mx.common.appName}</span>
            <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">
              CDMX
            </span>
          </Link>
          <nav aria-label={mx.common.navLabel} className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
            <Link to="/" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "!text-primary !bg-primary/10 font-semibold" }}>{mx.common.navSearch}</Link>
            <Link to="/mapa" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors" activeProps={{ className: "!text-primary !bg-primary/10 font-semibold" }}>{mx.common.navMap}</Link>
            <Link to="/fuentes" className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors" activeProps={{ className: "!text-primary !bg-primary/10 font-semibold" }}>{mx.common.navSources}</Link>
            <Link to="/publicar" className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow">
              <span>+ {mx.common.navPublish}</span>
            </Link>
            <button onClick={() => setLang(lang === "en" ? "es" : "en")} aria-label={mx.common.langLabel}
              className="ml-2 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              {mx.common.langToggle}
            </button>
          </nav>
        </div>
      </header>
      {waking && (
        <div role="status" className="bg-amber-500/10 text-amber-900 dark:text-amber-200 border-b border-amber-500/30">
          <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" aria-hidden /> {mx.common.waking}
          </div>
        </div>
      )}
      <main id="main" className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      <footer role="contentinfo" className="mt-16 border-t border-border bg-card text-card-foreground">
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">R</span>
                <span>{mx.common.appName}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Plataforma de arrendamiento habitacional con verificación jurídica automatizada, citas textuales de la ley mexicana y contratos digitales transparentes.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Enlaces rápidos</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Inicio y Viviendas en Renta</Link></li>
                <li><Link to="/mapa" className="hover:text-primary transition-colors">Explorador de Zonas y Precios</Link></li>
                <li><Link to="/publicar" className="hover:text-primary transition-colors">Publicar una Propiedad</Link></li>
                <li><Link to="/fuentes" className="hover:text-primary transition-colors">Marco Legal y Fuentes Oficiales</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Aviso normativo</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {disclaimer}
              </p>
            </div>
          </div>
          <div className="border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2026 Renta MX — Prototipo informativo de código abierto con verificación normativa estricta.</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Corpus legal verificado (CDMX & Federal)</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

let disclaimerStore: { lang: string; text: string } | undefined;
const dl = new Set<() => void>();
export function setDisclaimer(d?: string, lang?: string) { if (d && lang && (d !== disclaimerStore?.text || lang !== disclaimerStore?.lang)) { disclaimerStore = { lang, text: d }; dl.forEach((f) => f()); } }
function useDisclaimer() {
  const [, force] = useState(0);
  useEffect(() => { const f = () => force((x) => x + 1); dl.add(f); return () => { dl.delete(f); }; }, []);
  return disclaimerStore;
}

const badgeCls: Record<ResultKind, string> = {
  applies: "bg-applies-soft text-applies border-applies/40",
  superseded: "bg-superseded-soft text-superseded border-superseded/40",
  unknown: "bg-unknown-soft text-unknown border-unknown/40",
  not_yet_effective: "bg-future-soft text-future border-future/40",
  pending: "bg-pending-soft text-pending border-pending/40",
};
export function ResultBadge({ kind }: { kind: ResultKind }) {
  const { t } = useI18n();
  const label = kind === "unknown" ? t.unknownR : t[kind];
  return (
    <span aria-label={label} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-semibold ${badgeCls[kind] ?? badgeCls.unknown}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />{label}
    </span>
  );
}

export function StateMsg({ error, onRetry }: { error?: boolean; onRetry?: () => void }) {
  const { t } = useI18n();
  if (!error) return <p role="status" className="text-muted-foreground py-6">{t.loading}</p>;
  return (
    <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
      <p>{t.error}</p>
      {onRetry && <button onClick={onRetry} className="mt-2 rounded-md bg-primary px-4 py-2 text-primary-foreground">{t.retry}</button>}
    </div>
  );
}
