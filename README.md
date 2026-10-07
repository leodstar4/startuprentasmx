# Renta MX

Marketplace transparente para **rentar vivienda de largo plazo en México**: búsqueda por zona
(estado → municipio), mapa interactivo, estadísticas honestas de precios, checklist legal con cita
textual verificada por entidad, y generación + firma electrónica simple de contratos de arrendamiento.

> ⚖️ **No es asesoría legal.** Prototipo informativo. Cada afirmación legal enlaza a su fuente oficial
> con cita literal; verifíquela y consulte a un profesional antes de firmar o actuar.

## Qué es (en una tabla)

| | |
|---|---|
| Arquitectura | **Monolito Python**: un solo servicio FastAPI sirve la API (`/mx/*`) y el frontend desde el mismo origen |
| Frontend | TanStack Start + React 19 + Tailwind + shadcn/radix + MapLibre GL (build estático servido por FastAPI) |
| Backend / lógica | Python determinista en `mx/` (verificación de citas, precios, contratos, firma) |
| Datos legales | **229/229** requisitos con cita literal verificada sobre **85/85** documentos oficiales |
| Geografía | 32 estados · 2,478 municipios (INEGI Censo 2020) · 2,469 con coordenada (ITER 2020) |
| Estados con código civil estatal verificado | 11 (CDMX, Jalisco, Nuevo León, Edomex, Querétaro, Puebla, Yucatán, Quintana Roo, Guanajuato, Durango, Chihuahua); el resto, marco federal (`solo_federal`) |
| Persistencia | `JsonStore` efímero por defecto · **Supabase Postgres** vía `DATABASE_URL` (SqlStore) en producción |
| Pruebas | **199** tests MX, offline y deterministas |
| LLM / red en runtime | **ninguno** |

## Regla Cero (innegociable)

1. **Cero datos inventados.** Cada cifra, coordenada, artículo o monto viene de una fuente oficial
   descargada (`corpus_mx/manifest_*.json`) con `url`, `retrieved_at`, `sha256` y `text_sha256`.
2. **Cita literal verificable.** Cada requisito lleva un `quote` que `python -m mx.verify` confirma en
   el texto oficial. Si no aparece, no se exporta — y el deploy falla.
3. **$0 de LLM en runtime.** La plataforma es 100% determinista: no llama a APIs de IA para calcular
   precios, consultar leyes ni generar contratos.
4. **Sin anuncios inventados ni scraping.** El inventario arranca vacío; los precios solo se muestran
   con ≥ 3 anuncios reales de la zona.
5. **Sin fuente estatal verificada → se dice** (`solo_federal`), nunca se rellena.

## Estructura del repositorio

```
renta-mx/
├── api/
│   ├── main.py          # monolito: /mx/*, /health y sirve el frontend (StaticFiles + SPA fallback)
│   └── mx.py            # rutas /mx/* (read-only + listings/contracts/signatures)
├── mx/                  # lógica determinista (sin LLM, sin red)
│   ├── verify.py        # cascada de verificación de citas (Regla Cero)
│   ├── signatures.py    # firma simple + cadena de evidencia SHA-256
│   ├── contracts.py     # generación determinista de contratos
│   ├── prices.py        # resumen de precios (regla ≥3)
│   ├── zones.py         # índice de estados/municipios
│   ├── store.py         # JsonStore / SqlStore (SQLite · PostgreSQL)
│   └── ...
├── data/mx/             # zones.json, requirements/*.yaml, contract_clauses.yaml  (inmutable, verificado)
├── corpus_mx/           # 85 leyes oficiales (PDF/TXT) + manifests con hashes
├── frontend/            # TanStack Start (build estático servido por el monolito)
├── tests/               # 199 tests MX (offline)
├── .kiro/agents/        # 11 agentes: 7 originales + 4 nuevos (DB, Legal, Security, DevOps)
├── docs/DEPLOY.md       # despliegue del monolito + Supabase + R2
├── render.yaml          # blueprint de deploy (con gate de la Regla Cero en el build)
└── requirements.txt
```

## Correrlo localmente

```sh
# 1. Backend (API + verificación de la Regla Cero)
pip install -r requirements.txt
python -m mx.verify                 # debe terminar con ok=True (229/229)
uvicorn api.main:app --reload       # http://127.0.0.1:8000  (/health, /mx/health, /mx/states, ...)

# 2. Frontend en dev (opcional, split): apunta al backend con VITE_API_BASE
cd frontend
bun install
VITE_API_BASE=http://127.0.0.1:8000 bun run dev

# 3. Monolito (un solo servidor sirve API + frontend)
cd frontend && bun run build && cd ..   # genera frontend/.output/public
uvicorn api.main:app                     # http://127.0.0.1:8000 sirve el frontend y la API
```

En el monolito el frontend llama a la API en el **mismo origen** (`VITE_API_BASE` vacío por defecto).

## Verificación

```sh
python -m mx.verify     # Regla Cero: 229/229 requisitos, 85/85 documentos, 0 failed
python -m pytest -q     # 199 tests MX, offline
```

## Despliegue

Un solo servicio. Ver [`docs/DEPLOY.md`](docs/DEPLOY.md). Resumen:

- **Build:** `pip install` → `python -m mx.verify` (gate) → `bun run build` del frontend.
- **Datos:** Supabase Postgres (`DATABASE_URL`) para que listings/contratos persistan. Free al inicio.
- **Servidor:** Render Starter (~$7/mes) o Railway para que **no se duerma**; free solo para demo.
- **Fotos/PDFs (futuro):** Cloudflare R2 (egreso $0) vía presigned URLs.

## Agentes de desarrollo (`.kiro/agents/`)

7 originales (Architect, Planner, Implementor, Tester, Designer, UX, Budgeter) + 4 nuevos:
**The DB Architect**, **The Legal Curator**, **The Security & Auth Officer**, **The Cloud/DevOps Engineer**.

## Origen

Renta MX nació de un proyecto anterior (navegador de leyes de vivienda de EE. UU.). Este repositorio
es la versión **limpia y unificada**: se eliminó todo el legado de EE. UU. (extracción por IA, resolver,
rutas `/lookup`, `/rules`, etc.) y se consolidó en un monolito Python enfocado solo en México,
conservando intacta la lógica legal verificada.
