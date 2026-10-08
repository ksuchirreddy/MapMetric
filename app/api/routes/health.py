from __future__ import annotations

import logging

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.error import HealthResponse

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness + database connectivity",
    responses={503: {"model": HealthResponse, "description": "Database unreachable."}},
)
def health(session: Session = Depends(get_db)):
    try:
        session.execute(text("SELECT 1"))
    except SQLAlchemyError:
        logger.error("health_check_failed", exc_info=True)
        return JSONResponse(status_code=503, content={"status": "unhealthy", "database": "disconnected"})
    return HealthResponse(status="healthy", database="connected")


@router.get(
    "/ready",
    response_model=HealthResponse,
    summary="Readiness: database reachable and migrations applied",
    responses={503: {"model": HealthResponse, "description": "Not ready to serve traffic."}},
)
def ready(session: Session = Depends(get_db)):
    try:
        session.execute(text("SELECT 1"))
        schema_ready = inspect(session.get_bind()).has_table("files")
    except SQLAlchemyError:
        logger.error("readiness_check_failed", exc_info=True)
        return JSONResponse(status_code=503, content={"status": "not_ready", "database": "disconnected"})
    if not schema_ready:
        return JSONResponse(
            status_code=503, content={"status": "not_ready", "database": "migrations_pending"}
        )
    return HealthResponse(status="ready", database="connected")
