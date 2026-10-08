from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.core.enums import FeatureStatus, MeasurementType


class MeasurementItem(BaseModel):
    feature_id: int = Field(description="Zero-based feature index in file order.")
    geometry_type: str | None = None
    measurement_type: MeasurementType | None = None
    value: float | None = None
    unit: str | None = None
    status: FeatureStatus = Field(description="Per-feature processing outcome.")
    error_message: str | None = Field(
        default=None, description="Explains REPAIRED / unsupported / invalid features."
    )
    properties: dict[str, Any] | None = Field(
        default=None, description="Only returned with include_properties=true."
    )


class MeasurementsResponse(BaseModel):
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "file_id": "3f2b8c1e-5d0a-4b9e-8a57-0c1d2e3f4a5b",
                "total": 3,
                "measurements": [
                    {
                        "feature_id": 0,
                        "geometry_type": "Polygon",
                        "measurement_type": "area",
                        "value": 1250.52,
                        "unit": "m²",
                        "status": "OK",
                        "error_message": None,
                    },
                    {
                        "feature_id": 1,
                        "geometry_type": "LineString",
                        "measurement_type": "length",
                        "value": 342.18,
                        "unit": "m",
                        "status": "OK",
                        "error_message": None,
                    },
                    {
                        "feature_id": 2,
                        "geometry_type": "Point",
                        "measurement_type": None,
                        "value": None,
                        "unit": None,
                        "status": "OK",
                        "error_message": None,
                    },
                ],
            }
        }
    )

    file_id: uuid.UUID
    total: int = Field(description="Total features in the file (ignores limit/offset).")
    measurements: list[MeasurementItem]
