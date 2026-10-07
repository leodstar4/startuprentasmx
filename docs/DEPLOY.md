# Despliegue — Renta MX (monolito Python)

Renta MX es un **monolito**: un solo servicio FastAPI (`api/main.py`) que sirve las rutas de API
(`/mx/*`, `/health`) **y** el frontend (build estático de TanStack Start) desde el **mismo origen**.
Todo es determinista: sin llamadas a LLM ni a la red en runtime (Regla Cero).

> ⚖️ Prototipo informativo. **No es asesoría legal.**

## 1. Arquitectura de despliegue

```
                 ┌─────────────────────────────────────┐
   navegador  →  │  FastAPI (uvicorn)  — un solo origen │
                 │  • /mx/*      API determinista        │
                 │  • /health    liveness probe          │
                 │  • /*         frontend estático (SPA) │
                 └───────────────┬─────────────────────┘
                                 │ DATABASE_URL (psycopg)
                                 ▼
                         Supabase Postgres  (listings, contracts, signatures)
                                 │
                                 ▼ (futuro)
                         Cloudflare R2  (fotos de viviendas, PDFs de constancia)
```

## 2. Build (incluye el gate de la Regla Cero)

```sh
pip install -r requirements.txt
python -m mx.verify          # GATE: falla el deploy si una cita legal se rompe
cd frontend && bun install && bun run build && cd ..   # genera frontend/.output/public
```

`mx.verify` revalida cada requisito legal contra `corpus_mx/` (hoy **229/229** verificados sobre
**85/85** documentos, `ok=True`). Si algún `quote`, `sha256` o `text_sha256` no coincide, el build
falla y el deploy no procede.

## 3. Arranque

```sh
uvicorn api.main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'
```

`--proxy-headers` hace que `request.client.host` sea la IP real del cliente (rate limit de `/mx/*`).

## 4. Variables de entorno

| Var | Requerida | Propósito |
|---|---|---|
| `PYTHON_VERSION` | sí | runtime fijado (`3.12.10`) |
| `DATABASE_URL` | para producción | Postgres de Supabase; sin ella, store efímero en disco |
| `FRONTEND_DIST` | no | ruta del build del frontend (default `frontend/.output/public`) |
| `ALLOWED_ORIGINS` | no | orígenes CORS exactos extra (split dev). Mismo origen no necesita CORS |
| `MX_IP_SALT` | sí (auto) | sal para el hash de la IP en la evidencia de firma (nunca la IP en claro) |
| `OUT_DIR` | no | artefactos de runtime (reporte de validación, store JSON por defecto) |

## 5. Persistencia — Supabase Postgres (free al inicio)

`mx/store.py` elige el backend según `DATABASE_URL` (reportado honestamente en `/mx/health.store`):

| `DATABASE_URL` | Backend | Persistente |
|---|---|---|
| *(sin definir)* | archivos JSON en disco | No — se pierde al reiniciar |
| `sqlite:///ruta.db` | `sqlite3` (stdlib) | Solo mientras viva el disco |
| `postgres://…` / `postgresql://…` | `psycopg` (import perezoso) | **Sí** |

### Conectar Supabase (free)

1. Crea un proyecto en https://supabase.com (plan Free).
2. En el panel: **Settings → Database → Connection string → URI**. Copia la cadena
   `postgresql://postgres:[PASSWORD]@db.<ref>.supabase.co:5432/postgres`.
3. Para despliegues serverless/edge o con muchas conexiones, usa el **pooler** (modo *transaction*):
   el host `…pooler.supabase.com:6543`. Para un único worker de uvicorn, la conexión directa basta.
4. Pon esa cadena en `DATABASE_URL` (en Render: *Environment* del servicio; **no** la subas al repo).
5. Al arrancar, `SqlStore` crea sola la tabla `mx_store(collection, id, record, created_at)`
   (`init_schema`). No hay migración manual para el store documento-en-fila del MVP.

> El modelo relacional normalizado (states/municipalities/legal_requirements/listings/contracts con
> PostGIS) es el **siguiente paso** cuando se necesiten consultas espaciales e integridad referencial;
> lo diseña **The DB Architect**. El store actual es suficiente para el MVP.

### Límites honestos del free tier

- **Supabase Free:** ~0.5 GB de BD, pausa el proyecto tras ~1 semana de **inactividad total**
  (irrelevante con tráfico real). Upgrade a Pro (~$25/mes) cuando crezca el almacenamiento o se
  requiera no-pausa garantizada.
- **Render Free (web):** duerme tras ~15 min de inactividad; primer request tras dormir tarda ~1 min;
  disco **efímero**. Sirve para demo, **no** para “que no se apague”.
- **Render Starter (~$7/mes):** siempre encendido; sigue usando Postgres para persistencia.

## 6. “Que no se duerma y no pierda datos”

Requisito del proyecto. Camino recomendado:

1. **Datos → Supabase Postgres** (free): elimina la pérdida de datos al reiniciar, porque dejan de
   vivir en el disco efímero. **Esto no requiere cambiar código** (`SqlStore` ya habla Postgres).
2. **Servidor que no duerme → Render Starter (~$7/mes)** o Railway. El código es idéntico; es solo el
   plan de hosting. (Fly.io ya **no** tiene free tier, verificado.)
3. **Fotos/PDFs → Cloudflare R2** (egreso $0) vía presigned URLs; en BD solo la `storage_key`.

Para arrancar en modo desarrollo/demo basta Supabase free + Render free; el salto a “siempre
encendido” es cambiar el plan a Starter cuando se lance de verdad.

## 7. CI/CD (recomendado, lo detalla The Cloud/DevOps)

GitHub Actions: `pip install` → `python -m mx.verify` (gate Regla Cero) → `python -m pytest -q`
(hoy **199 tests MX** verdes) → `bun run build` del frontend. El deploy solo procede si el gate pasa.
