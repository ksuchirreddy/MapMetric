from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict, Field


class ErrorBody(BaseModel):
    code: str = Field(examples=["UNSUPPORTED_FILE_TYPE"])
    message: str = Field(examples=["Only KML and ZIP Shapefile files are supported."])
    file_id: uuid.UUID | None = Field(
        default=None, description="Present when a FAILED file record was persisted for tracing."
    )


class ErrorResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "detail": {
                    "code": "UNSUPPORTED_FILE_TYPE",
                    "message": "Only KML and ZIP Shapefile files are supported.",
                }
            }
        }
    )
    detail: ErrorBody


class HealthResponse(BaseModel):
    status: str = Field(examples=["healthy"])
    database: str = Field(examples=["connected"])
