"""Application factory.

Run with:  uvicorn app.main:create_app --factory
(a factory keeps imports side-effect free: no engine or settings at import time).
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import Engine

from app.api.errors import register_exception_handlers
from app.api.middleware import add_body_size_limit
from app.api.routes import files, health
from app.core.config import Settings, get_settings
from app.core.logging import setup_logging
from app.db.database import create_db_engine, create_session_factory

DESCRIPTION = """
Upload a **KML** file or a **ZIP containing a Shapefile** and get per-feature **area (m²)** and
**length (m)**.

Geographic coordinates (e.g. EPSG:4326) are never measured in degrees: each feature is transformed
into the local **UTM zone** first. Bad features are reported individually via a per-feature
`status` instead of failing the whole file.
"""

TAGS = [
    {"name": "files", "description": "Upload geospatial files and read their measurements."},
    {"name": "health", "description": "Liveness and readiness probes."},
]


def create_app(settings: Settings | None = None, engine: Engine | None = None) -> FastAPI:
    settings = settings or get_settings()
    setup_logging(settings.log_level, json_logs=settings.log_json)
    engine = engine or create_db_engine(settings.database_url)

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        yield
        engine.dispose()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=DESCRIPTION,
        openapi_tags=TAGS,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )
    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = create_session_factory(engine)

    register_exception_handlers(app)
    add_body_size_limit(app, settings.max_upload_size_bytes)
    app.include_router(health.router)
    app.include_router(files.router)
    return app


app = create_app()
