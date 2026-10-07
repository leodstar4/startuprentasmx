import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import {
  Bed,
  Bath,
  Maximize2,
  PawPrint,
  Armchair,
  ShieldCheck,
  MapPin,
  Calendar,
  FileCheck2,
  FileText,
  UserCheck,
  Scale,
  Sparkles,
} from "lucide-react";

import {
  apiGet,
  apiPost,
  fieldErrors,
  errorField,
  type MxListingDetail,
  type MxContractCreate,
  type MxContractCreated,
} from "@/lib/api";
import { setDisclaimer } from "@/components/Shell";
import { CoverageBadge, Disclaimer, MxError, MxLoading, useMx } from "@/components/mx/MxShared";
import { formatMXN } from "@/lib/mx-i18n";
import { Button } from "@/components/ui/button";

const FALLBACK_IMAGES: Record<string, string> = {
  "Roma Norte": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  "Condesa": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  "Juárez": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  "Del Valle Centro": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  "Lomas de Chapultepec": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "Narvarte Poniente": "https://images.unsplash.com/photo-1502005229762-ae1b465ab37d?auto=format&fit=crop&w=1200&q=80",
  "Guerrero": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
  "Del Carmen": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "Polanco": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  default: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
};

export const Route = createFileRoute("/vivienda/$id")({
  component: ListingPage,
});

function ListingPage() {
  const { id } = Route.useParams();
  const { mx, lang } = useMx();
  const [showForm, setShowForm] = useState(false);
  const q = useQuery({ queryKey: ["mx-listing", id, lang], queryFn: () => apiGet<MxListingDetail>(`/mx/listings/${id}?lang=${lang}`) });

  if (q.isLoading) return <MxLoading />;
  if (q.isError) return <MxError onRetry={() => q.refetch()} message={mx.listing.notFound} />;
  const l = q.data!;

  const imageUrl = l.image_url || FALLBACK_IMAGES[l.colonia] || FALLBACK_IMAGES.default;

  return (
    <div className="space-y-10">
      {/* Navigation Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span>›</span>
        <Link to="/zona/$cveEnt/$cveMun" params={{ cveEnt: l.cve_ent, cveMun: l.cve_mun }} className="hover:text-primary transition-colors">
          {l.colonia} (CDMX)
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold truncate max-w-xs">{l.title}</span>
      </nav>

      {/* Hero Visual Section */}
      <div className="relative aspect-[21/9] min-h-[300px] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-md">
        <img
          src={imageUrl}
          alt={l.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {l.colonia} · C.P. {l.cp}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/95 text-white backdrop-blur-md px-3 py-1 text-xs font-semibold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Marco Legal Verificado (CDMX)
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <h1 className="font-serif text-2xl font-bold md:text-4xl drop-shadow-md">
            {l.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="text-2xl font-extrabold text-white md:text-3xl drop-shadow-md">
              {formatMXN(l.monthly_rent_mxn, lang)} <span className="text-base font-normal opacity-90">/ mes</span>
            </span>
            {l.deposit_mxn != null && (
              <span className="rounded-lg bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold">
                Depósito requerido: {formatMXN(l.deposit_mxn, lang)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Main Details Column */}
        <article className="space-y-8">
          {/* Specs Highlights */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SpecCard icon={<Bed className="h-4 w-4 text-primary" />} label="Recámaras" value={String(l.bedrooms)} />
            <SpecCard icon={<Bath className="h-4 w-4 text-primary" />} label="Baños" value={String(l.bathrooms)} />
            <SpecCard icon={<Maximize2 className="h-4 w-4 text-primary" />} label="Superficie" value={l.area_m2 ? `${l.area_m2} m²` : "No especificada"} />
            <SpecCard icon={<Calendar className="h-4 w-4 text-primary" />} label="Disponible desde" value={l.available_from} />
          </section>

          {/* Amenities & Characteristics */}
          <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-foreground">Características principales</h2>
            <div className="flex flex-wrap gap-2.5">
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold ${l.furnished ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"}`}>
                <Armchair className="h-4 w-4" />
                {l.furnished ? "Completamente amueblado" : "Sin amueblar"}
              </span>
              <span className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold ${l.pets_allowed ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-muted text-muted-foreground"}`}>
                <PawPrint className="h-4 w-4" />
                {l.pets_allowed ? "Acepta mascotas (Pet Friendly)" : "No acepta mascotas"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-muted px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
                <FileCheck2 className="h-4 w-4" />
                Publicado por usuario verificado
              </span>
            </div>
          </section>

          {/* Description */}
          {l.description && (
            <section className="space-y-3 rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-foreground">{mx.listing.description}</h2>
              <p className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                {l.description}
              </p>
            </section>
          )}

          {/* Legal Protection Card */}
          <section className="space-y-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-xs">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">Garantía Legal de este Inmueble en CDMX</h3>
                <p className="text-xs text-muted-foreground">Regulado por el Código Civil del Distrito Federal y Código Civil Federal.</p>
              </div>
            </div>
            <ul className="space-y-2 text-xs text-foreground/90">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 font-bold">✓</span>
                <span><strong>Tope de incremento:</strong> En CDMX el incremento anual está acotado por la inflación oficial reportada por Banco de México.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 font-bold">✓</span>
                <span><strong>Depósito en garantía:</strong> Máximo pactado con devolución obligatoria al término si no hay daños o adeudos comprobables.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-emerald-600 font-bold">✓</span>
                <span><strong>Contrato escrito formal:</strong> La ley exige que el contrato conste por escrito con firma e identificación de ambas partes.</span>
              </li>
            </ul>
          </section>
        </article>

        {/* Aside Sidebar */}
        <aside className="space-y-5">
          <div className="sticky top-20 rounded-3xl border border-border/90 bg-card p-6 shadow-md space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground">Renta Mensual</span>
              <div className="text-3xl font-extrabold text-primary">
                {formatMXN(l.monthly_rent_mxn, lang)}
              </div>
              <p className="text-xs text-muted-foreground">
                Depósito: {l.deposit_mxn != null ? formatMXN(l.deposit_mxn, lang) : "A convenir"}
              </p>
            </div>

            <div className="rounded-2xl border border-border/80 bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Contacto del Propietario</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {l.contact_name} (Verificado en plataforma)
              </p>
            </div>

            <Button
              size="lg"
              className="w-full rounded-xl text-sm font-bold shadow-sm"
              onClick={() => setShowForm((v) => !v)}
            >
              <FileText className="mr-2 h-4 w-4" />
              {showForm ? "Ocultar formulario de contrato" : "Generar Contrato Digital"}
            </Button>

            <Button asChild variant="outline" className="w-full rounded-xl text-xs font-medium">
              <Link to="/requisitos/$cveEnt" params={{ cveEnt: l.cve_ent }}>
                {mx.listing.beforeRentingCta}
              </Link>
            </Button>

            <p className="text-center text-[11px] text-muted-foreground leading-normal">
              Sin comisiones ocultas ni anticipos sin contrato firmado.
            </p>
          </div>
        </aside>
      </div>

      {showForm && <ContractForm listing={l} />}
      <Disclaimer />
    </div>
  );
}

function SpecCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-serif text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

function ContractForm({ listing }: { listing: MxListingDetail }) {
  const { mx } = useMx();
  const navigate = useNavigate();
  const [withFiador, setWithFiador] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [v, setV] = useState({
    arrendadorNombre: "", arrendadorEmail: "", arrendatarioNombre: "", arrendatarioEmail: "",
    fiadorNombre: "", fiadorEmail: "",
    calle: "", numExt: "", numInt: "", colonia: listing.colonia, cp: listing.cp,
    rent: String(listing.monthly_rent_mxn), deposit: listing.deposit_mxn != null ? String(listing.deposit_mxn) : "0",
    startDate: new Date().toISOString().slice(0, 10), term: "12", paymentDay: "1",
  });
  const s = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setErrors({});
    setSubmitError(null);
    const body: MxContractCreate = {
      listing_id: listing.id, cve_ent: listing.cve_ent, cve_mun: listing.cve_mun,
      inmueble: { calle: v.calle.trim(), num_ext: v.numExt.trim(), num_int: v.numInt.trim() || null, colonia: v.colonia.trim(), cp: v.cp },
      arrendador: { full_name: v.arrendadorNombre.trim(), email: v.arrendadorEmail.trim() },
      arrendatario: { full_name: v.arrendatarioNombre.trim(), email: v.arrendatarioEmail.trim() },
      fiador: withFiador ? { full_name: v.fiadorNombre.trim(), email: v.fiadorEmail.trim() } : null,
      monthly_rent_mxn: Number(v.rent), deposit_mxn: Number(v.deposit), start_date: v.startDate,
      term_months: Number(v.term), payment_day: Number(v.paymentDay), lang: "es", acknowledge_solo_federal: true,
    };
    setSubmitting(true);
    try {
      const res = await apiPost<MxContractCreated>("/mx/contracts", body);
      navigate({ to: "/contrato/$id", params: { id: res.contract_id }, state: { signTokens: res.sign_tokens } as never });
    } catch (err) {
      const fe = fieldErrors(err);
      if (fe.length) setErrors(Object.fromEntries(fe.map((x) => [errorField(x) || "form", x.msg])));
      else setSubmitError(mx.contractForm.errGenerate);
    } finally {
      setSubmitting(false);
    }
  }

  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-destructive">{errors[k]}</p>;
  const cls = "rounded-xl border border-input bg-background px-3.5 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-primary/20 bg-card p-6 md:p-8 shadow-sm">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-bold text-primary">{mx.contractForm.title}</h2>
        <p className="text-xs text-muted-foreground">Genera el contrato oficial con las cláusulas obligatorias de CDMX y firma criptográfica.</p>
      </div>

      {submitError && <MxError message={submitError} />}
      {errors.form && <MxError message={errors.form} />}

      <fieldset className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <legend className="px-2 text-xs font-bold uppercase tracking-wider text-primary">{mx.contractForm.stepParties}</legend>
        <Field label={mx.contractForm.landlordSection + " · " + mx.contractForm.fullName}><input className={cls} value={v.arrendadorNombre} onChange={(e) => s("arrendadorNombre", e.target.value)} />{err("arrendador.full_name")}</Field>
        <Field label={mx.contractForm.email}><input type="email" className={cls} value={v.arrendadorEmail} onChange={(e) => s("arrendadorEmail", e.target.value)} />{err("arrendador.email")}</Field>
        <Field label={mx.contractForm.tenantSection + " · " + mx.contractForm.fullName}><input className={cls} value={v.arrendatarioNombre} onChange={(e) => s("arrendatarioNombre", e.target.value)} />{err("arrendatario.full_name")}</Field>
        <Field label={mx.contractForm.email}><input type="email" className={cls} value={v.arrendatarioEmail} onChange={(e) => s("arrendatarioEmail", e.target.value)} />{err("arrendatario.email")}</Field>
        <label className="flex items-center gap-2 text-xs font-medium sm:col-span-2 cursor-pointer pt-1">
          <input type="checkbox" checked={withFiador} onChange={(e) => setWithFiador(e.target.checked)} className="h-4 w-4 rounded" />
          <span>{mx.contractForm.includeGuarantor}</span>
        </label>
        {withFiador && <>
          <Field label={mx.contractForm.guarantorSection + " · " + mx.contractForm.fullName}><input className={cls} value={v.fiadorNombre} onChange={(e) => s("fiadorNombre", e.target.value)} />{err("fiador.full_name")}</Field>
          <Field label={mx.contractForm.email}><input type="email" className={cls} value={v.fiadorEmail} onChange={(e) => s("fiadorEmail", e.target.value)} />{err("fiador.email")}</Field>
        </>}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <legend className="px-2 text-xs font-bold uppercase tracking-wider text-primary">{mx.contractForm.stepProperty}</legend>
        <Field label="Calle"><input className={cls} value={v.calle} onChange={(e) => s("calle", e.target.value)} />{err("inmueble.calle")}</Field>
        <Field label="Número exterior"><input className={cls} value={v.numExt} onChange={(e) => s("numExt", e.target.value)} />{err("inmueble.num_ext")}</Field>
        <Field label="Número interior (opcional)"><input className={cls} value={v.numInt} onChange={(e) => s("numInt", e.target.value)} /></Field>
        <Field label={mx.publish.coloniaLabel}><input className={cls} value={v.colonia} onChange={(e) => s("colonia", e.target.value)} />{err("inmueble.colonia")}</Field>
        <Field label={mx.contractForm.cp}><input inputMode="numeric" maxLength={5} className={cls} value={v.cp} onChange={(e) => s("cp", e.target.value.replace(/\D/g, ""))} />{err("inmueble.cp")}</Field>
        <Field label={mx.contractForm.monthlyRent}><input inputMode="decimal" className={cls} value={v.rent} onChange={(e) => s("rent", e.target.value.replace(/[^\d.]/g, ""))} />{err("monthly_rent_mxn")}</Field>
        <Field label={mx.contractForm.deposit}><input inputMode="decimal" className={cls} value={v.deposit} onChange={(e) => s("deposit", e.target.value.replace(/[^\d.]/g, ""))} />{err("deposit_mxn")}</Field>
        <Field label={mx.contractForm.startDate}><input type="date" className={cls} value={v.startDate} onChange={(e) => s("startDate", e.target.value)} />{err("start_date")}</Field>
        <Field label={mx.contractForm.termMonths}><input type="number" min={1} max={120} className={cls} value={v.term} onChange={(e) => s("term", e.target.value)} />{err("term_months")}</Field>
        <Field label={mx.contractForm.paymentDay}><input type="number" min={1} max={28} className={cls} value={v.paymentDay} onChange={(e) => s("paymentDay", e.target.value)} />{err("payment_day")}</Field>
      </fieldset>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-xs text-muted-foreground">{mx.contractForm.generatedHow}</p>
        <Button type="submit" size="lg" disabled={submitting} className="rounded-xl shadow-sm">
          {submitting ? mx.contractForm.generating : mx.contractForm.generate}
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
