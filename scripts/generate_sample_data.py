"""Generate small, license-free sample fixtures into ./sample_data (standard library only).

All geometry is invented and located around central Bengaluru (EPSG:4326).
Run:  python scripts/generate_sample_data.py
"""

from __future__ import annotations

import struct
import zipfile
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "sample_data"

POLYGON = [(77.5900, 12.9700), (77.5910, 12.9700), (77.5910, 12.9710), (77.5900, 12.9710), (77.5900, 12.9700)]
LINE = [(77.5900, 12.9700), (77.5920, 12.9720), (77.5940, 12.9725)]
POINT = (77.5950, 12.9730)

WGS84_PRJ = (
    'GEOGCS["GCS_WGS_1984",DATUM["D_WGS_1984",SPHEROID["WGS_1984",6378137.0,298.257223563]],'
    'PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]]'
)


def _coords(points: list[tuple[float, float]]) -> str:
    return " ".join(f"{x},{y},0" for x, y in points)


def _placemark(name: str, geometry: str) -> str:
    return f"  <Placemark><name>{name}</name>{geometry}</Placemark>\n"


def _kml(*placemarks: str) -> str:
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n'
        + "".join(placemarks)
        + "</Document>\n</kml>\n"
    )


def _polygon_geom(points) -> str:
    return (
        "<Polygon><outerBoundaryIs><LinearRing><coordinates>"
        f"{_coords(points)}</coordinates></LinearRing></outerBoundaryIs></Polygon>"
    )


def _line_geom(points) -> str:
    return f"<LineString><coordinates>{_coords(points)}</coordinates></LineString>"


def _point_geom(point) -> str:
    return f"<Point><coordinates>{point[0]},{point[1]},0</coordinates></Point>"


def write_kmls() -> None:
    poly = _placemark("Plot A", _polygon_geom(POLYGON))
    line = _placemark("Path B", _line_geom(LINE))
    pt = _placemark("Marker C", _point_geom(POINT))
    (OUT / "polygon.kml").write_text(_kml(poly), encoding="utf-8")
    (OUT / "linestring.kml").write_text(_kml(line), encoding="utf-8")
    (OUT / "point.kml").write_text(_kml(pt), encoding="utf-8")
    (OUT / "mixed.kml").write_text(_kml(poly, line, pt), encoding="utf-8")


# ---- minimal polygon Shapefile writer (.shp/.shx/.dbf/.prj) -----------------------------------
def _signed_area(ring) -> float:
    return sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:], strict=False)) / 2


def _shp_header(file_words: int, bbox: tuple[float, float, float, float]) -> bytes:
    return (
        struct.pack(">i", 9994)
        + struct.pack(">5i", 0, 0, 0, 0, 0)
        + struct.pack(">i", file_words)
        + struct.pack("<2i", 1000, 5)  # version, shape type 5 = Polygon
        + struct.pack("<4d", *bbox)
        + struct.pack("<4d", 0.0, 0.0, 0.0, 0.0)  # Z/M ranges
    )


def write_polygon_shapefile(directory: Path, stem: str, rings, names) -> None:
    records, index = [], []
    offset_words = 50  # 100-byte header
    xs = [x for ring in rings for x, _ in ring]
    ys = [y for ring in rings for _, y in ring]
    bbox = (min(xs), min(ys), max(xs), max(ys))
    for number, ring in enumerate(rings, start=1):
        ring = list(ring)
        if _signed_area(ring) > 0:  # shapefile exterior rings are clockwise
            ring.reverse()
        rx, ry = [p[0] for p in ring], [p[1] for p in ring]
        content = (
            struct.pack("<i", 5)
            + struct.pack("<4d", min(rx), min(ry), max(rx), max(ry))
            + struct.pack("<2i", 1, len(ring))
            + struct.pack("<i", 0)
            + b"".join(struct.pack("<2d", x, y) for x, y in ring)
        )
        words = len(content) // 2
        records.append(struct.pack(">2i", number, words) + content)
        index.append(struct.pack(">2i", offset_words, words))
        offset_words += 4 + words
    (directory / f"{stem}.shp").write_bytes(_shp_header(offset_words, bbox) + b"".join(records))
    (directory / f"{stem}.shx").write_bytes(_shp_header(50 + 4 * len(rings), bbox) + b"".join(index))

    field_len = 32
    header_len = 32 + 32 + 1
    record_len = 1 + field_len
    dbf = struct.pack("<4BIHH20x", 3, 26, 10, 9, len(names), header_len, record_len)
    dbf += struct.pack("<11sc4xBB14x", b"NAME", b"C", field_len, 0) + b"\r"
    for name in names:
        dbf += b" " + name.encode("ascii")[:field_len].ljust(field_len)
    (directory / f"{stem}.dbf").write_bytes(dbf + b"\x1a")
    (directory / f"{stem}.prj").write_text(WGS84_PRJ, encoding="ascii")


def write_shapefile_zip() -> None:
    build = OUT / "_build"
    build.mkdir(exist_ok=True)
    stem = "plots"
    write_polygon_shapefile(
        build,
        stem,
        [
            POLYGON,
            [
                (77.6000, 12.9800),
                (77.6020, 12.9800),
                (77.6020, 12.9810),
                (77.6000, 12.9810),
                (77.6000, 12.9800),
            ],
        ],
        ["Plot A", "Plot D"],
    )
    with zipfile.ZipFile(OUT / "polygons_shapefile.zip", "w", zipfile.ZIP_DEFLATED) as archive:
        for part in sorted(build.iterdir()):
            archive.write(part, part.name)
            part.unlink()
    build.rmdir()


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    write_kmls()
    write_shapefile_zip()
    print(f"Sample data written to {OUT}")
