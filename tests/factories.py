"""Helpers that build tiny, purpose-made fixtures (no external datasets)."""

from __future__ import annotations

import io
import tempfile
import zipfile
from pathlib import Path

import geopandas as gpd
from pyproj import Geod
from shapely.geometry import LineString, Polygon

POLYGON = [(77.5900, 12.9700), (77.5910, 12.9700), (77.5910, 12.9710), (77.5900, 12.9710), (77.5900, 12.9700)]
LINE = [(77.5900, 12.9700), (77.5920, 12.9720), (77.5940, 12.9725)]
POINT = (77.5950, 12.9730)

_GEOD = Geod(ellps="WGS84")


def geodesic_area(coords) -> float:
    """Independent ground truth: area on the ellipsoid (m²)."""
    return abs(_GEOD.geometry_area_perimeter(Polygon(coords))[0])


def geodesic_length(coords) -> float:
    return _GEOD.geometry_length(LineString(coords))


def _coords(points) -> str:
    return " ".join(f"{x},{y},0" for x, y in points)


def polygon_placemark(name="Plot", points=POLYGON) -> str:
    return (
        f"<Placemark><name>{name}</name><Polygon><outerBoundaryIs><LinearRing><coordinates>"
        f"{_coords(points)}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>"
    )


def line_placemark(name="Path", points=LINE) -> str:
    coords = _coords(points)
    return (
        f"<Placemark><name>{name}</name><LineString><coordinates>"
        f"{coords}</coordinates></LineString></Placemark>"
    )


def point_placemark(name="Marker", point=POINT) -> str:
    return (
        f"<Placemark><name>{name}</name><Point><coordinates>"
        f"{point[0]},{point[1]},0</coordinates></Point></Placemark>"
    )


def kml_bytes(*placemarks: str) -> bytes:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<kml xmlns="http://www.opengis.net/kml/2.2"><Document>' + "".join(placemarks) + "</Document></kml>"
    ).encode()


def shapefile_zip_bytes(frame: gpd.GeoDataFrame, stem: str = "survey") -> bytes:
    with tempfile.TemporaryDirectory() as tmp:
        frame.to_file(Path(tmp) / f"{stem}.shp", driver="ESRI Shapefile")
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
            for part in sorted(Path(tmp).iterdir()):
                archive.write(part, part.name)
        return buffer.getvalue()


def zip_bytes(entries: dict[str, bytes]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, data in entries.items():
            archive.writestr(name, data)
    return buffer.getvalue()
