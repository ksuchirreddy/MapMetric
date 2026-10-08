"""Plain data carriers passed between services (no ORM, no web framework)."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from shapely.geometry.base import BaseGeometry

from app.core.enums import FeatureStatus, MeasurementType


@dataclass(slots=True)
class ExtractedFeature:
    index: int
    geometry_type: str | None
    geometry: BaseGeometry | None  # validated / repaired, 2D, in the source CRS
    properties: dict[str, Any] = field(default_factory=dict)
    status: FeatureStatus = FeatureStatus.OK
    message: str | None = None


@dataclass(slots=True)
class FeatureResult:
    index: int
    geometry_type: str | None
    properties: dict[str, Any]
    measurement_type: MeasurementType | None
    value: float | None
    unit: str | None
    status: FeatureStatus
    message: str | None
