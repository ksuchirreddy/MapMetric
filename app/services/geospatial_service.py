"""Reading KML / Shapefile data, CRS detection and feature extraction."""

from __future__ import annotations

import logging
import math
from datetime import date, datetime
from pathlib import Path
from typing import Any

import geopandas as gpd
import numpy as np
import pandas as pd
import pyogrio
from pyproj import CRS
from pyproj.exceptions import CRSError

from app.core.enums import FileType
from app.core.exceptions import AppError, CorruptedDataError, InvalidCrsError, MissingCrsError
from app.services.geometry_validation import check_geometry
from app.services.types import ExtractedFeature

logger = logging.getLogger(__name__)

KML_CRS = CRS.from_epsg(4326)  # the KML specification mandates WGS 84 lon/lat


class GeospatialService:
    def __init__(self, *, max_property_string_length: int = 4096) -> None:
        self._max_str = max_property_string_length

    # -- reading ---------------------------------------------------------
    def read_file(self, path: Path, file_type: FileType) -> gpd.GeoDataFrame:
        try:
            if file_type is FileType.KML:
                return self._read_kml(path)
            return pyogrio.read_dataframe(path)
        except AppError:
            raise
        except Exception as exc:
            raise CorruptedDataError("The file could not be read as valid geospatial data.") from exc

    def _read_kml(self, path: Path) -> gpd.GeoDataFrame:
        """GDAL's KML driver exposes every <Folder> as a layer; merge them all."""
        layer_names = [str(row[0]) for row in pyogrio.list_layers(path)]
        frames = [pyogrio.read_dataframe(path, layer=name) for name in layer_names]
        frames = [frame for frame in frames if not frame.empty]
        if not frames:
            return gpd.GeoDataFrame(geometry=[], crs=KML_CRS)
        if len(frames) == 1:
            return frames[0]
        combined = pd.concat(frames, ignore_index=True)
        return gpd.GeoDataFrame(combined, geometry="geometry", crs=frames[0].crs)

    # -- CRS -------------------------------------------------------------
    def detect_crs(self, frame: gpd.GeoDataFrame, file_type: FileType) -> CRS:
        """Return the source CRS or raise; a CRS is never silently guessed.

        KML is always WGS 84 by specification, so a missing CRS there is safe to
        fill in. A Shapefile without a usable .prj is refused.
        """
        raw = frame.crs
        if raw is None:
            if file_type is FileType.KML:
                return KML_CRS
            raise MissingCrsError(
                "No coordinate reference system found (the Shapefile has no .prj or it is "
                "empty). Measurements are refused rather than guessed."
            )
        try:
            crs = CRS.from_user_input(raw)
            if crs.is_compound:
                crs = crs.sub_crs_list[0]
        except CRSError as exc:
            raise InvalidCrsError("The coordinate reference system is invalid.") from exc
        if not (crs.is_geographic or crs.is_projected):
            raise InvalidCrsError("The coordinate reference system must be geographic or projected.")
        return crs

    # -- features --------------------------------------------------------
    def extract_features(self, frame: gpd.GeoDataFrame) -> list[ExtractedFeature]:
        records = self._property_records(frame)
        features: list[ExtractedFeature] = []
        for index, (geometry, properties) in enumerate(zip(frame.geometry, records, strict=True)):
            check = check_geometry(geometry)
            features.append(
                ExtractedFeature(
                    index=index,
                    geometry_type=geometry.geom_type if geometry is not None else None,
                    geometry=check.geometry,
                    properties=properties,
                    status=check.status,
                    message=check.message,
                )
            )
        return features

    def _property_records(self, frame: gpd.GeoDataFrame) -> list[dict[str, Any]]:
        attributes = pd.DataFrame(frame.drop(columns=frame.geometry.name))
        if attributes.shape[1] == 0:
            return [{} for _ in range(len(frame))]
        cleaned = attributes.astype(object).where(attributes.notna(), None)
        return [
            {str(key): self._json_safe(value) for key, value in row.items()}
            for row in cleaned.to_dict(orient="records")
        ]

    def _json_safe(self, value: Any) -> Any:
        """Make attribute values JSON/JSONB-safe and bounded in size."""
        if value is None:
            return None
        if isinstance(value, np.generic):
            value = value.item()
        if isinstance(value, bool):
            return value
        if isinstance(value, float):
            return value if math.isfinite(value) else None
        if isinstance(value, int):
            return value
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        # PostgreSQL JSONB rejects NUL characters; also cap very long strings.
        return str(value).replace("\x00", "")[: self._max_str]
