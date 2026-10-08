"""FastAPI dependencies: per-request session and service wiring."""

from __future__ import annotations

from collections.abc import Iterator

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.services.crs_service import CRSService
from app.services.file_service import FileService
from app.services.geospatial_service import GeospatialService
from app.services.measurement_service import MeasurementService


def get_app_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    session = request.app.state.session_factory()
    try:
        yield session
    finally:
        session.close()


def get_file_service(
    session: Session = Depends(get_db), settings: Settings = Depends(get_app_settings)
) -> FileService:
    crs_service = CRSService()
    return FileService(
        session=session,
        settings=settings,
        geospatial=GeospatialService(max_property_string_length=settings.max_property_string_length),
        measurement=MeasurementService(
            crs_service, support_multi_geometries=settings.support_multi_geometries
        ),
        crs_service=crs_service,
    )
