"""Area / length computation. Never measures in degrees."""

from __future__ import annotations

import logging
import math
from collections.abc import Sequence

import geopandas as gpd
from pyproj import CRS

from app.core.enums import FeatureStatus, MeasurementType
from app.services.crs_service import CRSService
from app.services.types import ExtractedFeature, FeatureResult

logger = logging.getLogger(__name__)

AREA_UNIT = "m²"
LENGTH_UNIT = "m"
ROUND_DIGITS = 4

_BLOCKING = {
    FeatureStatus.NULL_GEOMETRY,
    FeatureStatus.EMPTY_GEOMETRY,
    FeatureStatus.INVALID_GEOMETRY,
}


class MeasurementService:
    def __init__(self, crs_service: CRSService, *, support_multi_geometries: bool = True) -> None:
        self._crs = crs_service
        multi = support_multi_geometries
        self._area_types = {"Polygon"} | ({"MultiPolygon"} if multi else set())
        self._length_types = {"LineString"} | ({"MultiLineString"} if multi else set())
        self._unmeasured_types = {"Point"} | ({"MultiPoint"} if multi else set())

    def _classify(
        self, feature: ExtractedFeature
    ) -> tuple[MeasurementType | None, FeatureStatus, str | None]:
        if feature.status in _BLOCKING:
            return None, feature.status, feature.message
        geometry_type = feature.geometry_type
        if geometry_type in self._area_types:
            return MeasurementType.AREA, feature.status, feature.message
        if geometry_type in self._length_types:
            return MeasurementType.LENGTH, feature.status, feature.message
        if geometry_type in self._unmeasured_types:
            return None, feature.status, feature.message  # points: nothing to measure
        return (
            None,
            FeatureStatus.UNSUPPORTED_GEOMETRY,
            f"Geometry type '{geometry_type}' is not supported for measurement.",
        )

    def measure(self, features: Sequence[ExtractedFeature], source_crs: CRS) -> list[FeatureResult]:
        plans = {f.index: self._classify(f) for f in features}
        measurable = {
            f.index: f for f in features if plans[f.index][0] is not None and f.geometry is not None
        }

        values: dict[int, float] = {}
        failed: set[int] = set()
        if measurable:
            series = gpd.GeoSeries(
                [f.geometry for f in measurable.values()],
                index=list(measurable.keys()),
                crs=source_crs,
            )
            projection = self._crs.project_for_measurement(series)
            failed.update(projection.failed_index)
            for group in projection.groups:
                areas = group.geometries.area.to_dict()
                lengths = group.geometries.length.to_dict()
                for index in areas:
                    kind = plans[index][0]
                    raw = areas[index] if kind is MeasurementType.AREA else lengths[index]
                    if math.isfinite(raw):
                        values[index] = round(float(raw), ROUND_DIGITS)
                    else:
                        failed.add(index)

        results = [self._build_result(f, plans[f.index], values, failed) for f in features]
        logger.info(
            "measurements_computed",
            extra={
                "feature_count": len(results),
                "measured": len(values),
                "transform_errors": len(failed),
            },
        )
        return results

    @staticmethod
    def _build_result(
        feature: ExtractedFeature,
        plan: tuple[MeasurementType | None, FeatureStatus, str | None],
        values: dict[int, float],
        failed: set[int],
    ) -> FeatureResult:
        kind, status, message = plan
        value: float | None = None
        unit: str | None = None
        if kind is not None:
            if feature.index in failed or feature.index not in values:
                kind, status = None, FeatureStatus.TRANSFORM_ERROR
                message = "Coordinates could not be transformed to a projected CRS."
            else:
                value = values[feature.index]
                unit = AREA_UNIT if kind is MeasurementType.AREA else LENGTH_UNIT
        return FeatureResult(
            index=feature.index,
            geometry_type=feature.geometry_type,
            properties=feature.properties,
            measurement_type=kind,
            value=value,
            unit=unit,
            status=status,
            message=message,
        )
