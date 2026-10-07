"""Seed demo listings so the demo is not empty and looks visually appealing.

Run:  python scripts/seed_demo_listings.py
Uses the same store as the API (DATABASE_URL env or JSON store at MX_STORE_DIR).
"""
from __future__ import annotations

import os
import uuid
from datetime import date, timezone, datetime
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from mx.store import make_store
from mx import paths

DEMO_LISTINGS = [
    {
        "cve_ent": "09", "cve_mun": "015", "cp": "06700",
        "colonia": "Roma Norte", "title": "Depto contemporáneo con balcón en Roma Norte",
        "description": "Hermoso departamento exterior con balcón en el corazón cultural de Roma Norte. Sala-comedor de concepto abierto, cocina equipada con cubierta de cuarzo, recámara principal con vestidor y baño en suite. Edificio pet-friendly con elevador, roof garden común y seguridad privada 24/7.",
        "monthly_rent_mxn": 22500, "deposit_mxn": 22500,
        "bedrooms": 2, "bathrooms": 2.0, "area_m2": 82,
        "furnished": True, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 1)),
        "contact_name": "María González", "contact_email": "demo1@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "015", "cp": "06760",
        "colonia": "Condesa", "title": "Penthouse art déco arbolado frente a Parque México",
        "description": "Extraordinario penthouse en edificio clásico catalogado sobre Amsterdam. Techos altos, pisos de madera original restaurada, terraza privada con vista al follaje urbano y acabados de lujo. Incluye bodega, 2 cajones de estacionamiento fijos e independientes.",
        "monthly_rent_mxn": 29000, "deposit_mxn": 29000,
        "bedrooms": 2, "bathrooms": 2.0, "area_m2": 105,
        "furnished": False, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 15)),
        "contact_name": "Roberto Castro", "contact_email": "demo2@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "015", "cp": "06600",
        "colonia": "Juárez", "title": "Estudio ejecutivo amueblado cerca de Reforma",
        "description": "Estudio minimalista completamente amueblado y equipado listo para habitar. Ideal para nómadas digitales o profesionistas jóvenes. A 3 cuadras del Ángel de la Independencia. Edificio inteligente con coworking y gimnasio.",
        "monthly_rent_mxn": 14500, "deposit_mxn": 14500,
        "bedrooms": 1, "bathrooms": 1.0, "area_m2": 45,
        "furnished": True, "pets_allowed": False,
        "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 15)),
        "contact_name": "Carlos Mendoza", "contact_email": "demo3@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "014", "cp": "03100",
        "colonia": "Del Valle Centro", "title": "Casa familiar con jardín privado y garage doble",
        "description": "Residencia de estilo colonial moderno en calle tranquila y arbolada. Dos niveles, amplio jardín privado ideal para mascotas o convivencias, estudio/oficina independiente, cuarto de servicio completo y portón automático para dos autos.",
        "monthly_rent_mxn": 36000, "deposit_mxn": 72000,
        "bedrooms": 3, "bathrooms": 2.5, "area_m2": 195,
        "furnished": False, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 12, 1)),
        "contact_name": "Sofía Ramírez", "contact_email": "demo4@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "016", "cp": "11000",
        "colonia": "Lomas de Chapultepec", "title": "Residencia de lujo con vistas panorámicas",
        "description": "Propiedad de alta gama en exclusivo condominio horizontal con vigilancia estricta 24 horas. Acabados en mármol, cocina italiana de diseñador, calefacción hidrónica, terraza con vista a la cañada y 3 lugares de estacionamiento.",
        "monthly_rent_mxn": 62000, "deposit_mxn": 124000,
        "bedrooms": 3, "bathrooms": 3.5, "area_m2": 240,
        "furnished": True, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 1)),
        "contact_name": "Andrés Villanueva", "contact_email": "demo5@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "014", "cp": "03020",
        "colonia": "Narvarte Poniente", "title": "Depto nuevo muy iluminado con roof top común",
        "description": "Excelente departamento en piso 4 con vista despejada. Sala-comedor amplia, cocina abierta, persianas black-out incluidas, estacionamiento techado y elevador. A solo 5 minutos caminando de centros comerciales y avenidas principales.",
        "monthly_rent_mxn": 17800, "deposit_mxn": 17800,
        "bedrooms": 2, "bathrooms": 2.0, "area_m2": 78,
        "furnished": False, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1502005229762-ae1b465ab37d?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 20)),
        "contact_name": "Fernanda Morales", "contact_email": "demo6@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "015", "cp": "06030",
        "colonia": "Guerrero", "title": "Loft contemporáneo remodelado cerca de Bellas Artes",
        "description": "Loft con diseño industrial cálido, techos altos, muros de ladrillo aparente y ventanales acústicos dobles. Muy cerca del centro histórico y metro Garibaldi/Bellas Artes. Excelente relación calidad/precio.",
        "monthly_rent_mxn": 11000, "deposit_mxn": 11000,
        "bedrooms": 1, "bathrooms": 1.0, "area_m2": 50,
        "furnished": True, "pets_allowed": False,
        "image_url": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 1)),
        "contact_name": "Laura Torres", "contact_email": "demo7@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "003", "cp": "04000",
        "colonia": "Del Carmen", "title": "Casona colonial con patio privado en Coyoacán",
        "description": "Encantador hogar colonial a unas cuadras de la plaza Hidalgo y los Viveros de Coyoacán. Patio central con fuente de cantera, vigas de madera, cocina rústica mexicana y atmósfera de tranquilidad inigualable.",
        "monthly_rent_mxn": 24000, "deposit_mxn": 24000,
        "bedrooms": 2, "bathrooms": 2.0, "area_m2": 110,
        "furnished": False, "pets_allowed": True,
        "image_url": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 10)),
        "contact_name": "Guillermo Pardo", "contact_email": "demo8@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
    {
        "cve_ent": "09", "cve_mun": "016", "cp": "11560",
        "colonia": "Polanco", "title": "Suite de lujo en Polanco V Sección con alberca y gym",
        "description": "Residencia de prestigio en torre de clase mundial sobre Horacio. Amenidades completas: alberca climatizada, gimnasio de última generación, spa, salón de eventos y concierge 24 horas. Pisos de madera de ingeniería y acabados premium.",
        "monthly_rent_mxn": 48000, "deposit_mxn": 48000,
        "bedrooms": 2, "bathrooms": 2.5, "area_m2": 135,
        "furnished": True, "pets_allowed": False,
        "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
        "available_from": str(date(2026, 11, 5)),
        "contact_name": "Valentina Sotomayor", "contact_email": "demo9@rentamx.demo",
        "truthfulness_consent": True, "privacy_consent": True,
    },
]


def main() -> None:
    store = make_store(paths.store_dir())
    listings_dir = paths.store_dir() / "listings"
    if listings_dir.exists():
        for f in listings_dir.glob("*.json"):
            try:
                f.unlink()
            except Exception:
                pass

    added = 0
    for listing in DEMO_LISTINGS:
        rid = uuid.uuid4().hex
        record = {
            **listing,
            "id": rid,
            "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "status": "published",
        }
        store.put("listings", rid, record)
        print(f"  added: {listing['title']} (${listing['monthly_rent_mxn']:,}/mes)")
        added += 1
    print(f"\nSeed completo: {added} listings demo agregados con fotos y detalles.")
    print(f"Total en store: {store.count('listings')} listings.")


if __name__ == "__main__":
    main()
