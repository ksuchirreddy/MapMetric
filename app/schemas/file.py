from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import FileStatus


class FileUploadResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "3f2b8c1e-5d0a-4b9e-8a57-0c1d2e3f4a5b",
                "filename": "survey.kml",
                "feature_count": 3,
                "crs": "EPSG:4326",
                "status": "COMPLETED",
            }
        },
    )

    id: uuid.UUID
    filename: str
    feature_count: int
    crs: str | None = Field(default=None, validation_alias="original_crs")
    status: FileStatus


class FileDetailResponse(FileUploadResponse):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "3f2b8c1e-5d0a-4b9e-8a57-0c1d2e3f4a5b",
                "filename": "survey.kml",
                "file_type": "KML",
                "feature_count": 3,
                "crs": "EPSG:4326",
                "status": "COMPLETED",
                "created_at": "2026-10-09T08:30:12.123456Z",
                "updated_at": "2026-10-09T08:30:12.456789Z",
                "processing_time_ms": 87,
                "error_code": None,
                "error_message": None,
            }
        },
    )

    file_type: str
    created_at: datetime
    updated_at: datetime
    processing_time_ms: int | None = None
    error_code: str | None = None
    error_message: str | None = None
