import { Link } from "@tanstack/react-router";
import { Bed, Bath, Maximize2, PawPrint, Armchair, ShieldCheck, MapPin } from "lucide-react";
import type { MxListing } from "@/lib/api";
import { formatMXN } from "@/lib/mx-i18n";
import { useMx } from "@/components/mx/MxShared";

const FALLBACK_IMAGES: Record<string, string> = {
  "Roma Norte": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
  "Condesa": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
  "Juárez": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  "Del Valle Centro": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  "Lomas de Chapultepec": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "Narvarte Poniente": "https://images.unsplash.com/photo-1502005229762-ae1b465ab37d?auto=format&fit=crop&w=800&q=80",
  "Guerrero": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
  "Del Carmen": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  "Polanco": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
};

export function ListingCard({ listing }: { listing: MxListing }) {
  const { lang } = useMx();
  const imageUrl = listing.image_url || FALLBACK_IMAGES[listing.colonia] || FALLBACK_IMAGES.default;

  return (
    <Link
      to="/vivienda/$id"
      params={{ id: listing.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Location badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-foreground shadow-sm">
          <MapPin className="h-3 w-3 text-primary" />
          <span>{listing.colonia}</span>
        </div>

        {/* Legal verification pill */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-600/90 text-white backdrop-blur-md px-2.5 py-1 text-[11px] font-medium shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Ley Verificada</span>
        </div>

        {/* Bottom price tag on photo */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <div>
            <span className="text-2xl font-black tracking-tight drop-shadow-md">
              {formatMXN(listing.monthly_rent_mxn, lang)}
            </span>
            <span className="text-xs font-medium text-white/90 drop-shadow"> / mes</span>
          </div>
          {listing.deposit_mxn != null && (
            <span className="rounded-md bg-white/20 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white">
              Depósito: {formatMXN(listing.deposit_mxn, lang)}
            </span>
          )}
        </div>
      </div>

      {/* Content body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
          {listing.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {listing.description}
        </p>

        {/* Key specs */}
        <div className="mt-4 grid grid-cols-3 divide-x divide-border/60 rounded-xl bg-muted/40 py-2.5 text-center text-xs">
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <Bed className="h-3.5 w-3.5" /> Recs
            </span>
            <span className="font-bold text-foreground">{listing.bedrooms}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <Bath className="h-3.5 w-3.5" /> Baños
            </span>
            <span className="font-bold text-foreground">{Number(listing.bathrooms)}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <Maximize2 className="h-3.5 w-3.5" /> Área
            </span>
            <span className="font-bold text-foreground">{listing.area_m2 ? `${listing.area_m2} m²` : "—"}</span>
          </div>
        </div>

        {/* Tags footer */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-1">
          {listing.furnished && (
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              <Armchair className="h-3 w-3" /> Amueblado
            </span>
          )}
          {listing.pets_allowed && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <PawPrint className="h-3 w-3" /> Pet friendly
            </span>
          )}
          <span className="ml-auto text-[11px] font-medium text-muted-foreground">
            C.P. {listing.cp}
          </span>
        </div>
      </div>
    </Link>
  );
}
