"""Application exceptions.

These are plain Python exceptions (no FastAPI imports) so the geospatial and
service layers stay independent of the web framework. The API layer maps them
to HTTP responses in ``app/api/errors.py``.
"""

from __future__ import annotations

import uuid


class AppError(Exception):
    """Base class for all expected, client-presentable errors."""

    status_code: int = 500
    code: str = "INTERNAL_ERROR"

    def __init__(self, message: str, *, file_id: uuid.UUID | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.file_id = file_id


class UnsupportedFileTypeError(AppError):
    status_code = 400
    code = "UNSUPPORTED_FILE_TYPE"


class EmptyFileError(AppError):
    status_code = 400
    code = "EMPTY_FILE"


class FileTooLargeError(AppError):
    status_code = 413
    code = "PAYLOAD_TOO_LARGE"


class MalformedKmlError(AppError):
    status_code = 400
    code = "MALFORMED_KML"


class InvalidZipError(AppError):
    status_code = 400
    code = "INVALID_ZIP"


class UnsafeZipError(AppError):
    status_code = 400
    code = "UNSAFE_ZIP"


class InvalidShapefileError(AppError):
    status_code = 400
    code = "INVALID_SHAPEFILE"


class CorruptedDataError(AppError):
    status_code = 422
    code = "CORRUPTED_GEOSPATIAL_DATA"


class MissingCrsError(AppError):
    status_code = 422
    code = "CRS_MISSING"


class InvalidCrsError(AppError):
    status_code = 422
    code = "CRS_INVALID"


class FileNotFoundInStoreError(AppError):
    status_code = 404
    code = "FILE_NOT_FOUND"


class FileNotCompletedError(AppError):
    status_code = 409
    code = "FILE_NOT_COMPLETED"


class ProcessingError(AppError):
    status_code = 500
    code = "PROCESSING_ERROR"
