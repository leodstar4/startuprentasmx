"""Renta MX API — Python monolith. Serves the /mx/* routes and (in production) the built
frontend as static files from the same origin. Read-only except listings/contracts/signatures,
which persist to the store (SqlStore on Postgres when DATABASE_URL is set, else an ephemeral
JSON store). No LLM, no network calls at runtime.

Run locally:  uvicorn api.main:app --reload
Build gate (Regla Cero):  python -m mx.verify  (fails the deploy if any legal quote is broken)
"""

from __future__ import annotations

import functools
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from mx import data as mx_data
from mx import paths
from .mx import MxBodyLimit
from .mx import router as mx_router

API_VERSION = "2.0.0"

#: Allowed CORS origins. Same-origin (frontend served by this app) needs no CORS; the regex keeps
#: working for split dev setups (Vite dev server, Lovable/Cloudflare preview domains). ALLOWED_ORIGINS
#: adds exact origins (comma-separated).
ORIGIN_REGEX = (
    r"https://([a-z0-9-]+\.)*(lovable\.app|lovable\.dev|lovableproject\.com|pages\.dev)"
    r"|http://(localhost|127\.0\.0\.1)(:\d+)?"
)

#: Directory of the built frontend (TanStack Start static output). Served at the root in production.
#: Overridable with FRONTEND_DIST; absent in dev/CI (the API still runs, serving only /mx/*).
def frontend_dist() -> Path:
    return Path(os.getenv("FRONTEND_DIST", paths.ROOT / "frontend" / ".output" / "public"))


@functools.lru_cache(maxsize=1)
def store():
    """Compatibility shim kept so tests can reset lazily-loaded state with ``store.cache_clear()``.
    The real listings/contracts store lives in ``api.mx`` (``get_store``); MX reference data loads
    lazily via ``mx.data.current()``. Returns None — nothing US-era is loaded here anymore."""
    return None


@asynccontextmanager
async def _lifespan(_app):
    # Warm the MX reference data once (tolerant: /mx/* answers 503 if data/corpus are missing).
    try:
        mx_data.current()
    except Exception:
        pass
    yield


app = FastAPI(
    title="Renta MX API",
    version=API_VERSION,
    lifespan=_lifespan,
    description="Marketplace de arrendamiento en México con requisitos legales citados. No es asesoría legal.",
)

# MxBodyLimit added first so CORS stays the outermost middleware.
app.add_middleware(MxBodyLimit)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ORIGIN_REGEX,
    allow_origins=[o for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(mx_router)  # Renta MX routes (/mx/*); data loaded lazily, 503 if missing.


@app.get("/health")
def health() -> dict:
    """Liveness probe for the deploy platform. Reports whether MX data loaded and the frontend build."""
    try:
        mx_data.current()
        mx_ready = True
    except Exception:
        mx_ready = False
    return {"status": "ok", "version": API_VERSION, "mx_data": mx_ready,
            "frontend": frontend_dist().exists()}


# --------------------------------------------------------------------------- #
# Frontend (monolith): serve the built SPA at the root, with history-fallback.
# Mounted LAST so it never shadows /mx/* or /health. Only mounted when the build exists.
# --------------------------------------------------------------------------- #
_dist = frontend_dist()
if _dist.exists():
    _assets = _dist / "assets"
    if _assets.exists():
        app.mount("/assets", StaticFiles(directory=_assets), name="assets")

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        """Serve a built static file if it exists, else fall back to index.html (SPA routing).
        API paths are already handled by the router/health above and never reach here."""
        candidate = (_dist / full_path).resolve()
        # Prevent path traversal: the resolved file must stay inside the dist dir.
        if full_path and _dist in candidate.parents and candidate.is_file():
            return FileResponse(candidate)
        index = _dist / "index.html"
        if index.is_file():
            return FileResponse(index)
        return JSONResponse({"detail": "frontend build not found"}, status_code=404)
