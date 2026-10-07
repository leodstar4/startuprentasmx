"""Shared test configuration for Renta MX. All tests are offline and deterministic:
no LLM client, no network. Reference-data tests use the fixtures under tests/fixtures/mx via
the helpers in tests/mx_support.py (mx_env / client fixtures).
"""

from __future__ import annotations

import pytest


@pytest.fixture(autouse=True)
def _ephemeral_out(tmp_path, monkeypatch):
    """Default OUT_DIR to a temp dir so any artifact (e.g. out/mx_validation.json) a test writes
    without the mx_env fixture never lands in the repo. Tests that use mx_env override this with
    their own OUT_DIR."""
    monkeypatch.setenv("OUT_DIR", str(tmp_path / "out"))
