"""Application settings, read from environment variables (or a local .env)."""

from __future__ import annotations

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

MiB = 1024 * 1024


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Geospatial File Measurement API"
    app_version: str = "1.0.0"
    environment: str = "development"
    log_level: str = "INFO"
    log_json: bool = True

    database_url: str = "postgresql+psycopg2://geospatial:dev-only-change-me@localhost:5432/geospatial"

    # Upload / archive limits (treat every upload as untrusted).
    max_upload_size_bytes: int = 25 * MiB
    max_uncompressed_size_bytes: int = 200 * MiB
    max_zip_entries: int = 200
    max_compression_ratio: int = 200

    # Enhancement: measure Multi* geometries (sum of parts). Set false to report
    # them as UNSUPPORTED_GEOMETRY exactly as the base assignment describes.
    support_multi_geometries: bool = True

    insert_batch_size: int = 1000
    max_property_string_length: int = 4096


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # database_url comes from the environment
