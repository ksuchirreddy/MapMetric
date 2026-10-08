"""CRS strategy: when to trust the source CRS and how to pick a projected CRS.

Rule of thumb implemented here: **never measure in degrees**. Distances and areas
are computed only in a metre-based projected CRS that is appropriate locally.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field

import geopandas as gpd
import numpy as np
from pyproj import CRS

from app.core.exceptions import ProcessingError
from app.services.utm import utm_epsg_codes

logger = logging.getLogger(__name__)

WGS84 = CRS.from_epsg(4326)


@dataclass(slots=True)
class ProjectedGroup:
    crs: CRS
    geometries: gpd.GeoSeries  # already transformed into ``crs``


@dataclass(slots=True)
class ProjectionResult:
    groups: list[ProjectedGroup] = field(default_factory=list)
    failed_index: list = field(default_factory=list)  # features whose location is unusable


class CRSService:
    def format_crs(self, crs: CRS) -> str:
        """Human-readable identifier, e.g. ``EPSG:4326`` (falls back to the CRS name)."""
        authority = crs.to_authority(min_confidence=70)
        if authority:
            return f"{authority[0]}:{authority[1]}"
        return crs.name[:255]

    def is_direct_measurement_crs(self, crs: CRS) -> bool:
        """True if geometry may be measured as-is in this CRS.

        Requires a projected CRS with metre units that is not a Mercator-family
        projection. Web Mercator (EPSG:3857) is metre-based but inflates areas
        enormously away from the equator (≈ 1/cos²(lat)), so it is re-projected.
        Foot-based CRSs are also re-projected rather than converting units, which
        keeps one single, well-tested code path.
        """
        if not crs.is_projected or not crs.axis_info:
            return False
        if abs(crs.axis_info[0].unit_conversion_factor - 1.0) > 1e-9:
            return False
        method = (crs.coordinate_operation.method_name if crs.coordinate_operation else "") or ""
        method = method.lower()
        return not ("mercator" in method and "transverse" not in method and "oblique" not in method)

    def project_for_measurement(self, geoms: gpd.GeoSeries) -> ProjectionResult:
        """Return the geometries in a metric projected CRS suitable for measuring.

        * Metric projected source CRS -> measured directly (no transformation).
        * Otherwise: take each feature's ``representative_point`` (guaranteed to lie
          on the geometry, unlike a centroid), derive its lon/lat, select the local
          UTM zone, group features by zone, and transform each group once.
        """
        if geoms.empty:
            return ProjectionResult()
        source_crs = CRS.from_user_input(geoms.crs)

        if self.is_direct_measurement_crs(source_crs):
            logger.info("crs_direct_measurement", extra={"crs": self.format_crs(source_crs)})
            return ProjectionResult(groups=[ProjectedGroup(source_crs, geoms)])

        try:
            return self._project_via_utm(geoms, source_crs)
        except Exception as exc:  # pyproj/GDAL failures are systemic, not per-feature
            raise ProcessingError("Coordinate transformation to a projected CRS failed.") from exc

    def _project_via_utm(self, geoms: gpd.GeoSeries, source_crs: CRS) -> ProjectionResult:
        geographic = geoms if source_crs == WGS84 else geoms.to_crs(epsg=4326)
        anchors = geographic.representative_point()
        lon = anchors.x.to_numpy(dtype=float)
        lat = anchors.y.to_numpy(dtype=float)
        usable = np.isfinite(lon) & np.isfinite(lat) & (np.abs(lat) <= 90.0)

        codes = utm_epsg_codes(np.where(usable, lon, 0.0), np.where(usable, lat, 0.0))
        result = ProjectionResult(failed_index=list(geoms.index[~usable]))
        for code in np.unique(codes[usable]):
            mask = usable & (codes == code)
            target = CRS.from_epsg(int(code))
            subset = geoms[mask]
            # Transform the *original* geometry straight to UTM (a single hop,
            # so no accuracy is lost via an intermediate WGS 84 step).
            result.groups.append(ProjectedGroup(target, subset.to_crs(target)))
            logger.info(
                "crs_transformation",
                extra={
                    "source_crs": self.format_crs(source_crs),
                    "target_crs": f"EPSG:{int(code)}",
                    "feature_count": int(mask.sum()),
                },
            )
        return result
