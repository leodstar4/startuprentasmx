"""Data roots, resolved on every call (not at import) so tests can point them at fixtures.

Env overrides: MX_DATA_DIR (default data/mx), MX_CORPUS_DIR (default corpus_mx),
MX_STORE_DIR (default <OUT_DIR>/mx_store).
"""

from __future__ import annotations

import os
from pathlib import Path

#: Repo root (mx/paths.py -> mx/ -> repo). Independent of any US legacy module.
ROOT: Path = Path(__file__).resolve().parent.parent

#: Output dir for runtime artifacts (validation report, default ephemeral store).
#: Overridable with OUT_DIR; defaults to <repo>/out.
def out_dir() -> Path:
    return Path(os.getenv("OUT_DIR", ROOT / "out"))


def root() -> Path:
    return ROOT


def data_root() -> Path:
    return Path(os.getenv("MX_DATA_DIR", ROOT / "data" / "mx"))


def corpus_root() -> Path:
    return Path(os.getenv("MX_CORPUS_DIR", ROOT / "corpus_mx"))


def store_dir() -> Path:
    return Path(os.getenv("MX_STORE_DIR", out_dir() / "mx_store"))


def validation_path() -> Path:
    return out_dir() / "mx_validation.json"


def resolve(p: str, corpus: Path) -> Path:
    """Manifest paths are repo-relative ("corpus_mx/fed/CCF.txt"); also accept corpus-relative."""
    path = Path(p)
    if path.is_absolute():
        return path
    for base in (corpus.parent, corpus, ROOT):
        if (base / path).exists():
            return base / path
    return corpus.parent / path
