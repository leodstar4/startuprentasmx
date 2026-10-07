import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect, useId, useMemo, useState } from "react";
import { Check, Database, FileText, Search, Sparkles, Shield, Building2, MapPin, ArrowRight } from "lucide-react";

import { apiGet, type MxStates, type MxZones, type MxZoneSearchItem, type MxListings, type MxListing } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { setDisclaimer } from "@/components/Shell";
import { CoverageBadge, MxError, useMx } from "@/components/mx/MxShared";
import { ListingCard } from "@/components/mx/ListingCard";
import { ZoneMapExplorer } from "@/routes/mapa";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renta MX — Marketplace con Respaldo Jurídico" },
      { name: "description", content: "Busque por zona, vea las viviendas publicadas y los requisitos legales con su cita literal, y firme su contrato en línea." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  const { mx, lang } = useMx();
  const states = useQuery({ queryKey: ["mx-states", lang], queryFn: () => apiGet<MxStates>(`/mx/states?lang=${lang}`), staleTime: 5 * 60_000 });
  const listingsQuery = useQuery({
    queryKey: ["mx-home-listings", lang],
    queryFn: () => apiGet<MxListings>(`/mx/listings?lang=${lang}`),
    staleTime: 60_000,
  });

  useEffect(() => setDisclaimer(states.data?.disclaimer, lang), [states.data, lang]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const list = states.data?.states ?? [];
  const shownStates = onlyVerified ? list.filter((s) => s.legal_coverage === "estatal_verificada") : list;

  const rawListings: MxListing[] = listingsQuery.data?.listings ?? [];

  const filteredListings = useMemo(() => {
    if (activeCategory === "all") return rawListings;
    if (activeCategory === "roma_condesa") {
      return rawListings.filter((l) => l.colonia.includes("Roma") || l.colonia.includes("Condesa"));
    }
    if (activeCategory === "polanco_lomas") {
      return rawListings.filter((l) => l.colonia.includes("Polanco") || l.colonia.includes("Lomas") || l.colonia.includes("Juárez"));
    }
    if (activeCategory === "sur_centro") {
      return rawListings.filter((l) => l.colonia.includes("Valle") || l.colonia.includes("Narvarte") || l.colonia.includes("Carmen") || l.colonia.includes("Guerrero"));
    }
    if (activeCategory === "pets") {
      return rawListings.filter((l) => l.pets_allowed === true);
    }
    if (activeCategory === "furnished") {
      return rawListings.filter((l) => l.furnished === true);
    }
    return rawListings;
  }, [rawListings, activeCategory]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-background p-6 md:p-12 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 backdrop-blur px-3.5 py-1 text-xs font-semibold text-primary shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Marketplace con Citas Jurídicas Oficiales</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
            Renta en México con <span className="text-primary underline decoration-primary/30 decoration-wavy">certeza legal</span> absoluta
          </h1>
          <p className="text-base text-muted-foreground md:text-lg leading-relaxed">
            Explora departamentos y casas verificadas en CDMX, conoce los topes de depósito y aumentos según el Código Civil y genera contratos digitales listos para firmar.
          </p>
        </div>

        {/* Search bar inside Hero */}
        <div className="mt-8">
          <ZoneSearch states={states.data?.states ?? []} />
        </div>

        {/* Feature badges */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: <Shield className="h-4 w-4 text-emerald-600" />, title: "Cero Fraudes", text: "Reglas claras sobre pagos y depósitos antes de anticipar dinero." },
            { icon: <FileText className="h-4 w-4 text-primary" />, title: "Citas Oficiales", text: "Cada requisito jurídico está respaldado por el DOF y Gacetas Oficiales." },
            { icon: <Database className="h-4 w-4 text-indigo-600" />, title: "Datos INEGI", text: "Estadísticas públicas de porcentaje de vivienda en arrendamiento." },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-3 rounded-2xl border border-border/80 bg-background/70 backdrop-blur p-4 shadow-sm">
              <div className="rounded-xl bg-card p-2 shadow-xs">{p.icon}</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{p.title}</h4>
                <p className="mt-0.5 text-xs text-muted-foreground leading-normal">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Listings Section */}
      <section aria-labelledby="listings-title" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Catálogo Disponible</span>
            </div>
            <h2 id="listings-title" className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              Viviendas destacadas en Ciudad de México
            </h2>
            <p className="text-sm text-muted-foreground">
              Inmuebles listos para arrendamiento con marco normativo vigente (CDMX).
            </p>
          </div>
          <Button asChild variant="outline" className="w-fit self-start sm:self-auto">
            <Link to="/publicar" className="flex items-center gap-1.5">
              <span>Publicar nueva propiedad</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: `Todas (${rawListings.length})` },
            { id: "roma_condesa", label: "Roma & Condesa" },
            { id: "polanco_lomas", label: "Polanco & Juárez" },
            { id: "sur_centro", label: "Del Valle, Narvarte & Coyoacán" },
            { id: "pets", label: "Pet Friendly 🐾" },
            { id: "furnished", label: "Amueblados 🛋️" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Listings */}
        {listingsQuery.isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-muted/40" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">No hay viviendas en esta categoría</p>
            <p className="mt-1 text-xs text-muted-foreground">Prueba seleccionando "Todas" para ver el catálogo completo.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Map Explorer Section */}
      <section aria-labelledby="map-title" className="space-y-4 rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm">
        <div className="max-w-3xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <MapPin className="h-4 w-4" />
            <span>Georreferencia</span>
          </div>
          <h2 id="map-title" className="font-serif text-2xl font-bold text-foreground">{mx.map.sectionTitle}</h2>
          <p className="text-sm text-muted-foreground">{mx.map.sectionIntro}</p>
        </div>
        <ZoneMapExplorer cveEnt="09" stateName="Ciudad de México" />
      </section>

      {/* States Directory Section */}
      <section aria-labelledby="states-title" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="states-title" className="font-serif text-2xl font-bold text-foreground">{mx.landing.statesTitle}</h2>
            <p className="text-xs text-muted-foreground">Consulta las leyes aplicables en cada entidad federativa de México.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer rounded-lg border border-border bg-card px-3 py-1.5 shadow-xs">
            <input type="checkbox" checked={onlyVerified} onChange={(e) => setOnlyVerified(e.target.checked)} className="h-3.5 w-3.5 rounded" />
            <span>{mx.coverage.stateVerified}</span>
          </label>
        </div>
        {states.isError ? (
          <MxError message={mx.landing.statesError} onRetry={() => states.refetch()} />
        ) : states.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-muted/40" />)}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shownStates.map((s) => (
              <Link key={s.cve_ent} to="/requisitos/$cveEnt" params={{ cveEnt: s.cve_ent }}
                className="group flex flex-col justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5">
                <div className="space-y-1">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                  <div>
                    <CoverageBadge coverage={s.legal_coverage} />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">{mx.listingsCount(s.listings_count)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works Section */}
      <section aria-labelledby="how-title" className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 id="how-title" className="font-serif text-2xl font-bold text-foreground md:text-3xl">{mx.landing.howTitle}</h2>
          <p className="text-xs text-muted-foreground">Proceso transparente y legalmente estructurado en 5 pasos.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {mx.landing.howSteps.map((step, i) => (
            <li key={i} className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-xs">{i + 1}</span>
              <p className="text-xs font-medium leading-relaxed text-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Bottom Publish Prompt */}
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 shadow-xs">
        <div className="space-y-1 max-w-lg">
          <h3 className="font-serif text-xl font-bold text-foreground">{mx.landing.publishPrompt}</h3>
          <p className="text-xs text-muted-foreground">Publica tu inmueble con contrato protegido bajo el Código Civil y encuentra inquilinos verificados.</p>
        </div>
        <Button asChild size="lg" className="rounded-xl shadow-sm">
          <Link to="/publicar">{mx.landing.publishCta}</Link>
        </Button>
      </section>
    </div>
  );
}

function ZoneSearch({ states }: { states: MxStates["states"] }) {
  const { mx, lang } = useMx();
  const navigate = useNavigate();
  const stateId = useId();
  const munId = useId();
  const [cveEnt, setCveEnt] = useState("09"); // Preselect CDMX for best demo UX!
  const [q, setQ] = useState("");
  const [deb, setDeb] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  useEffect(() => { const h = setTimeout(() => setDeb(q.trim()), 300); return () => clearTimeout(h); }, [q]);

  const zones = useQuery({
    queryKey: ["mx-zone-search", cveEnt, deb, lang],
    queryFn: () => apiGet<MxZones>(`/mx/zones?cve_ent=${cveEnt}&q=${encodeURIComponent(deb)}&limit=20&lang=${lang}`),
    enabled: !!cveEnt && deb.length >= 2,
    placeholderData: keepPreviousData,
  });
  const list: MxZoneSearchItem[] = zones.data?.zones ?? [];
  const stateName = useMemo(() => states.find((s) => s.cve_ent === cveEnt)?.name ?? "Ciudad de México", [states, cveEnt]);
  const pick = (m: MxZoneSearchItem) => navigate({ to: "/zona/$cveEnt/$cveMun", params: { cveEnt, cveMun: m.cve_mun } });

  return (
    <fieldset className="grid max-w-3xl gap-3 rounded-2xl border border-border/90 bg-card/95 backdrop-blur-md p-5 shadow-md sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] sm:items-end">
      <legend className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wider text-primary">
        <Search className="h-3.5 w-3.5" aria-hidden /> {mx.landing.searchLegend}
      </legend>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={stateId} className="text-xs font-semibold text-muted-foreground">{mx.landing.stateLabel}</label>
        <select
          id={stateId}
          value={cveEnt}
          onChange={(e) => { setCveEnt(e.target.value); setQ(""); setOpen(false); }}
          className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">{mx.landing.statePlaceholder}</option>
          {states.map((s) => <option key={s.cve_ent} value={s.cve_ent}>{s.name}</option>)}
        </select>
      </div>
      <div className="relative flex flex-col gap-1.5">
        <label htmlFor={munId} className="text-xs font-semibold text-muted-foreground">{mx.landing.municipioLabel}</label>
        <input
          id={munId}
          role="combobox"
          aria-expanded={open}
          aria-controls={munId + "-list"}
          aria-autocomplete="list"
          disabled={!cveEnt}
          value={q}
          placeholder={cveEnt ? "Escribe ej. Cuauhtémoc, Benito Juárez..." : mx.landing.municipioDisabled}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, list.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && list[active]) { e.preventDefault(); pick(list[active]); }
            if (e.key === "Escape") setOpen(false);
          }}
          className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <span className="sr-only" role="status" aria-live="polite">{deb.length >= 2 ? mx.landing.municipioResults(list.length) : ""}</span>
        {open && cveEnt && deb.length >= 2 && (
          <ul id={munId + "-list"} role="listbox" className="absolute top-full z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-xl">
            {zones.isFetching && !list.length && <li className="px-4 py-3 text-xs text-muted-foreground">{mx.common.loading}</li>}
            {!zones.isFetching && !list.length && <li className="px-4 py-3 text-xs text-muted-foreground">{mx.landing.municipioNoMatches(deb, stateName)}</li>}
            {list.map((m, i) => (
              <li
                key={m.cve_mun}
                role="option"
                aria-selected={i === active}
                onMouseDown={() => pick(m)}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2 text-xs transition-colors ${i === active ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"}`}
              >
                <span>{m.name}</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{mx.listingsCount(m.listings_count)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link
        to="/requisitos/$cveEnt"
        params={{ cveEnt: cveEnt || "09" }}
        disabled={!cveEnt}
        className={`rounded-xl border border-border px-4 py-2.5 text-center text-xs font-semibold transition-colors hover:bg-muted ${cveEnt ? "text-primary" : "pointer-events-none opacity-40"}`}
      >
        {mx.landing.seeStateRequirements}
      </Link>
    </fieldset>
  );
}
