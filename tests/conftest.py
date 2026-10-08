from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db import models  # noqa: F401
from app.db.database import Base
from app.main import create_app


def make_settings(**overrides) -> Settings:
    base = {"database_url": "sqlite+pysqlite://", "log_level": "WARNING", "log_json": False}
    return Settings(_env_file=None, **{**base, **overrides})


@pytest.fixture
def engine():
    # In-memory SQLite keeps the suite runnable without PostgreSQL.
    engine = create_engine(
        "sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def client(engine):
    with TestClient(create_app(make_settings(), engine)) as test_client:
        yield test_client


@pytest.fixture
def small_limit_client(engine):
    """Client whose upload limit is 1 KB, to exercise the oversize paths."""
    settings = make_settings(max_upload_size_bytes=1024)
    with TestClient(create_app(settings, engine)) as test_client:
        yield test_client


def upload(client: TestClient, name: str, data: bytes, content_type: str = "application/octet-stream"):
    return client.post("/api/files/", files={"file": (name, data, content_type)})
