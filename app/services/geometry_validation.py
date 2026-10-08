"""Explicit geometry-validation strategy (documented in the README).

1. ``None``             -> NULL_GEOMETRY      (feature kept, not measured)
2. empty geometry       -> EMPTY_GEOMETRY     (feature kept, not measured)
3. non-finite coords    -> INVALID_GEOMETRY   (NaN/inf cannot be repaired meaningfully)
4. already valid        -> OK
5. invalid              -> ``shapely.make_valid`` (preserves all area / length, unlike
   ``buffer(0)`` which can silently drop parts of bow-tie polygons), then keep only
   parts matching the original dimension. If nothing usable remains (e.g. a
   zero-area sliver) -> INVALID_GEOMETRY, otherwise REPAIRED with an explanation.
Z/M values are dropped (``force_2d``): measurements are planar and elevation is ignored.
"""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass

import numpy as np
import shapely
from shapely.geometry import MultiLineString, MultiPolygon
from shapely.geometry.base import BaseGeometry
from shapely.validation import explain_validity

from app.core.enums import FeatureStatus

_POLYGONAL = {"Polygon", "MultiPolygon"}
_LINEAR = {"LineString", "MultiLineString"}
_COLLECTIONS = {"MultiPolygon", "MultiLineString", "MultiPoint", "GeometryCollection"}


@dataclass(frozen=True, slots=True)
class GeometryCheck:
    geometry: BaseGeometry | None
    status: FeatureStatus
    message: str | None = None


def check_geometry(geometry: BaseGeometry | None) -> GeometryCheck:
    if geometry is None:
        return GeometryCheck(None, FeatureStatus.NULL_GEOMETRY, "Feature has no geometry.")
    if geometry.is_empty:
        return GeometryCheck(None, FeatureStatus.EMPTY_GEOMETRY, "Feature geometry is empty.")

    geometry = shapely.force_2d(geometry)
    if not np.isfinite(shapely.get_coordinates(geometry)).all():
        return GeometryCheck(
            None, FeatureStatus.INVALID_GEOMETRY, "Geometry contains non-finite coordinates."
        )
    if geometry.is_valid:
        return GeometryCheck(geometry, FeatureStatus.OK)
    return _repair(geometry)


def _iter_parts(geometry: BaseGeometry) -> Iterator[BaseGeometry]:
    if geometry.geom_type in _COLLECTIONS:
        for part in geometry.geoms:
            yield from _iter_parts(part)
    else:
        yield geometry


def _keep_original_dimension(repaired: BaseGeometry, original_type: str) -> BaseGeometry | None:
    """``make_valid`` may return collections with stray lower-dimension fragments."""
    if original_type in _POLYGONAL:
        wanted, multi = "Polygon", MultiPolygon
    elif original_type in _LINEAR:
        wanted, multi = "LineString", MultiLineString
    else:
        return repaired
    parts = [p for p in _iter_parts(repaired) if p.geom_type == wanted and not p.is_empty]
    if not parts:
        return None
    return parts[0] if len(parts) == 1 else multi(parts)


def _repair(geometry: BaseGeometry) -> GeometryCheck:
    reason = explain_validity(geometry)
    repaired = _keep_original_dimension(shapely.make_valid(geometry), geometry.geom_type)
    if repaired is None or repaired.is_empty or not repaired.is_valid:
        return GeometryCheck(
            None,
            FeatureStatus.INVALID_GEOMETRY,
            f"Geometry is invalid and could not be repaired ({reason}).",
        )
    return GeometryCheck(
        repaired,
        FeatureStatus.REPAIRED,
        f"Geometry was invalid ({reason}) and was repaired with make_valid.",
    )
