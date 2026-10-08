"""Upload validation, ZIP safety and geometry-validation strategy."""

from __future__ import annotations

import io
import struct
import zipfile

import pytest
from shapely.geometry import GeometryCollection, LineString, Point, Polygon

from app.core.enums import FeatureStatus
from app.core.exceptions import (
    FileTooLargeError,
    InvalidShapefileError,
    InvalidZipError,
    MalformedKmlError,
    UnsafeZipError,
    UnsupportedFileTypeError,
)
from app.services.geometry_validation import check_geometry
from app.utils.file_validation import (
    extract_shapefile_zip,
    save_stream_with_limit,
    validate_kml,
    validate_upload_name,
)
from tests.factories import kml_bytes, polygon_placemark, zip_bytes

LIMITS = {"max_entries": 50, "max_uncompressed": 10 * 1024 * 1024, "max_ratio": 200}


def shp_stub() -> bytes:
    return struct.pack(">i", 9994) + b"\x00" * 96


def extract(tmp_path, data: bytes, **overrides):
    archive = tmp_path / "in.zip"
    archive.write_bytes(data)
    return extract_shapefile_zip(archive, tmp_path / "out", **{**LIMITS, **overrides})


class TestUploadName:
    @pytest.mark.parametrize("name", ["a.kml", "A.KML", "dir/sub/a.kml", "C:\\x\\a.kml"])
    def test_kml_accepted_and_sanitised(self, name):
        safe, kind = validate_upload_name(name)
        assert kind.value == "KML" and "/" not in safe and "\\" not in safe

    @pytest.mark.parametrize("name", [None, "", "   ", "a.txt", "a.geojson", "a.kmz", "noext"])
    def test_unsupported(self, name):
        with pytest.raises(UnsupportedFileTypeError):
            validate_upload_name(name)


class TestSizeLimit:
    def test_within_limit(self, tmp_path):
        assert save_stream_with_limit(io.BytesIO(b"x" * 10), tmp_path / "f", 10) == 10

    def test_over_limit_aborts(self, tmp_path):
        with pytest.raises(FileTooLargeError):
            save_stream_with_limit(io.BytesIO(b"x" * 11), tmp_path / "f", 10)


class TestKml:
    def test_valid(self, tmp_path):
        path = tmp_path / "a.kml"
        path.write_bytes(kml_bytes(polygon_placemark()))
        validate_kml(path)

    @pytest.mark.parametrize(
        "content",
        [
            b"",
            b"not xml at all",
            b"<kml><Document></kml>",
            b"<?xml version='1.0'?><gpx/>",
            b'<?xml version="1.0"?><!DOCTYPE kml [<!ENTITY a "b">]><kml>&a;</kml>',
        ],
    )
    def test_rejected(self, tmp_path, content):
        path = tmp_path / "a.kml"
        path.write_bytes(content)
        with pytest.raises(MalformedKmlError):
            validate_kml(path)


class TestZipSafety:
    def test_valid_shapefile_parts_extracted(self, tmp_path):
        data = zip_bytes(
            {"Survey.SHP": shp_stub(), "Survey.SHX": b"x", "Survey.DBF": b"x", "Survey.PRJ": b"p"}
        )
        shp = extract(tmp_path, data)
        assert shp.name == "survey.shp" and shp.with_suffix(".prj").exists()

    def test_nested_directory_and_macos_junk(self, tmp_path):
        data = zip_bytes(
            {
                "data/s.shp": shp_stub(),
                "data/s.shx": b"x",
                "data/s.dbf": b"x",
                "__MACOSX/data/._s.shp": b"junk",
            }
        )
        assert extract(tmp_path, data).parent.name == "data"

    @pytest.mark.parametrize(
        "evil", ["../evil.shp", "a/../../evil.shp", "/etc/evil.shp", "C:/evil.shp", "..\\evil.shp"]
    )
    def test_path_traversal_rejected(self, tmp_path, evil):
        data = zip_bytes({"ok.shp": shp_stub(), "ok.shx": b"x", "ok.dbf": b"x", evil: b"pwn"})
        with pytest.raises(UnsafeZipError):
            extract(tmp_path, data)
        assert not (tmp_path.parent / "evil.shp").exists()

    def test_not_a_zip(self, tmp_path):
        with pytest.raises(InvalidZipError):
            extract(tmp_path, b"this is not a zip")

    def test_truncated_zip(self, tmp_path):
        data = zip_bytes({"a.shp": shp_stub() * 50, "a.shx": b"x", "a.dbf": b"x"})
        with pytest.raises((InvalidZipError, InvalidShapefileError)):
            extract(tmp_path, data[: len(data) // 2])

    def test_zip_without_shapefile(self, tmp_path):
        with pytest.raises(InvalidShapefileError):
            extract(tmp_path, zip_bytes({"readme.txt": b"hello", "photo.jpg": b"x"}))

    @pytest.mark.parametrize("missing", ["shx", "dbf"])
    def test_missing_required_component(self, tmp_path, missing):
        parts = {"a.shp": shp_stub(), "a.shx": b"x", "a.dbf": b"x"}
        del parts[f"a.{missing}"]
        with pytest.raises(InvalidShapefileError, match=missing):
            extract(tmp_path, zip_bytes(parts))

    def test_shp_with_bad_magic(self, tmp_path):
        data = zip_bytes({"a.shp": b"garbage-bytes", "a.shx": b"x", "a.dbf": b"x"})
        with pytest.raises(InvalidShapefileError):
            extract(tmp_path, data)

    def test_multiple_shapefiles_rejected(self, tmp_path):
        parts = {
            f"{n}.{e}": (shp_stub() if e == "shp" else b"x") for n in "ab" for e in ("shp", "shx", "dbf")
        }
        with pytest.raises(InvalidShapefileError):
            extract(tmp_path, zip_bytes(parts))

    def test_too_many_entries(self, tmp_path):
        parts = {f"f{i}.txt": b"x" for i in range(10)}
        with pytest.raises(UnsafeZipError):
            extract(tmp_path, zip_bytes(parts), max_entries=5)

    def test_zip_bomb_by_total_size(self, tmp_path):
        data = zip_bytes({"a.shp": b"\x00" * (2 * 1024 * 1024), "a.shx": b"x", "a.dbf": b"x"})
        with pytest.raises(UnsafeZipError):
            extract(tmp_path, data, max_uncompressed=1024 * 1024)

    def test_zip_bomb_by_ratio(self, tmp_path):
        data = zip_bytes({"a.shp": b"\x00" * (5 * 1024 * 1024), "a.shx": b"x", "a.dbf": b"x"})
        with pytest.raises(UnsafeZipError):
            extract(tmp_path, data, max_ratio=50)

    def test_symlink_rejected(self, tmp_path):
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, "w") as archive:
            info = zipfile.ZipInfo("link.shp")
            info.external_attr = (0o120777) << 16
            archive.writestr(info, "/etc/passwd")
        with pytest.raises(UnsafeZipError):
            extract(tmp_path, buffer.getvalue())


class TestGeometryValidation:
    def test_null(self):
        assert check_geometry(None).status is FeatureStatus.NULL_GEOMETRY

    def test_empty(self):
        assert check_geometry(Polygon()).status is FeatureStatus.EMPTY_GEOMETRY

    def test_valid_passthrough(self):
        poly = Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])
        check = check_geometry(poly)
        assert check.status is FeatureStatus.OK and check.geometry.equals(poly)

    def test_z_dropped(self):
        check = check_geometry(Point(1, 2, 3))
        assert not check.geometry.has_z

    def test_bowtie_repaired_without_losing_area(self):
        bowtie = Polygon([(0, 0), (2, 2), (2, 0), (0, 2), (0, 0)])
        check = check_geometry(bowtie)
        assert check.status is FeatureStatus.REPAIRED
        assert check.geometry.is_valid and check.geometry.area == pytest.approx(2.0)
        assert "make_valid" in check.message

    def test_degenerate_polygon_is_invalid(self):
        sliver = Polygon([(0, 0), (1, 1), (2, 2), (0, 0)])
        assert check_geometry(sliver).status is FeatureStatus.INVALID_GEOMETRY

    def test_non_finite_coordinates(self):
        bad = LineString([(0, 0), (float("nan"), 1)])
        assert check_geometry(bad).status is FeatureStatus.INVALID_GEOMETRY

    def test_geometry_collection_passes_validation(self):
        # Valid but unsupported: rejected later by MeasurementService, not here.
        collection = GeometryCollection([Point(0, 0), LineString([(0, 0), (1, 1)])])
        assert check_geometry(collection).status is FeatureStatus.OK
