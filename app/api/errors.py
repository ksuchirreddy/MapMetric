"""Consistent error envelope: ``{"detail": {"code": ..., "message": ...}}``."""

from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.exceptions import AppError

logger = logging.getLogger(__name__)


def error_response(status_code: int, code: str, message: str, file_id: object | None = None):
    detail: dict[str, str] = {"code": code, "message": message}
    if file_id is not None:
        detail["file_id"] = str(file_id)
    return JSONResponse(status_code=status_code, content={"detail": detail})


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError):
        return error_response(exc.status_code, exc.code, exc.message, exc.file_id)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError):
        problems = "; ".join(f"{'.'.join(str(p) for p in err['loc'])}: {err['msg']}" for err in exc.errors())
        return error_response(422, "VALIDATION_ERROR", f"Invalid request: {problems}")

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_error(_: Request, exc: StarletteHTTPException):
        code = {404: "NOT_FOUND", 405: "METHOD_NOT_ALLOWED"}.get(exc.status_code, "HTTP_ERROR")
        return error_response(exc.status_code, code, str(exc.detail))

    @app.exception_handler(OperationalError)
    async def handle_db_unavailable(_: Request, exc: OperationalError):
        logger.error("database_unavailable", exc_info=exc)
        return error_response(503, "DATABASE_UNAVAILABLE", "The database is currently unavailable.")

    @app.exception_handler(SQLAlchemyError)
    async def handle_db_error(_: Request, exc: SQLAlchemyError):
        logger.error("database_error", exc_info=exc)
        return error_response(500, "DATABASE_ERROR", "A database error occurred.")

    @app.exception_handler(Exception)
    async def handle_unexpected(_: Request, exc: Exception):
        logger.error("unhandled_exception", exc_info=exc)  # stack trace stays server-side
        return error_response(500, "INTERNAL_ERROR", "An unexpected error occurred.")
