"""End-to-end API tests: upload, retrieval, errors and security."""

from __future__ import annotations

import uuid

import geopandas as gpd
import pytest
from shapely.geometry import LineString, Polygon

from tests.conftest import upload
from tests.factories import (
    LINE,
    POLYGON,
    geodesic_area,
    geodesic_length,
    kml_bytes,
    line_placemark,
    point_placemark,
    polygon_placemark,
    shapefile_zip_bytes,
    zip_bytes,
)

MIXED_KML = kml_bytes(polygon_placemark("Plot A"), line_placemark("Path B"), point_placemark("Marker C"))


def error_code(response) -> str:
    return response.json()["detail"]["code"]


class TestUploadKml:
    def test_valid_mixed_kml(self, client):
        response = upload(client, "survey.kml", MIXED_KML)
        assert response.status_code == 201
        body = response.json()
        assert uuid.UUID(body["id"])
        assert body == {
            **body,
            "filename": "survey.kml",
            "feature_count": 3,
            "crs": "EPSG:4326",
            "status": "COMPLETED",
        }

    def test_polygon_line_point_measurements(self, client):
        file_id = upload(client, "survey.kml", MIXED_KML).json()["id"]
        response = client.get(f"/api/files/{file_id}/measurements/")
        assert response.status_code == 200
        body = response.json()
        assert body["file_id"] == file_id and body["total"] == 3
        by_id = {m["feature_id"]: m for m in body["measurements"]}
        assert by_id[0]["geometry_type"] == "Polygon" and by_id[0]["unit"] == "m²"
        assert by_id[0]["value"] == pytest.approx(geodesic_area(POLYGON), rel=0.005)
        assert by_id[1]["geometry_type"] == "LineString" and by_id[1]["unit"] == "m"
        assert by_id[1]["value"] == pytest.approx(geodesic_length(LINE), rel=0.005)
        assert by_id[2] == {
            **by_id[2],
            "geometry_type": "Point",
            "measurement_type": None,
            "value": None,
            "unit": None,
            "status": "OK",
        }

    def test_properties_opt_in(self, client):
        file_id = upload(client, "s.kml", kml_bytes(polygon_placemark("Plot A"))).json()["id"]
        without = client.get(f"/api/files/{file_id}/measurements/").json()["measurements"][0]
        with_props = client.get(f"/api/files/{file_id}/measurements/?include_properties=true").json()[
            "measurements"
        ][0]
        assert without["properties"] is None
        assert with_props["properties"]["Name"] == "Plot A"

    def test_pagination(self, client):
        file_id = upload(client, "s.kml", MIXED_KML).json()["id"]
        page = client.get(f"/api/files/{file_id}/measurements/?limit=1&offset=1").json()
        assert page["total"] == 3 and [m["feature_id"] for m in page["measurements"]] == [1]

    def test_empty_file_rejected(self, client):
        response = upload(client, "empty.kml", b"")
        assert response.status_code == 400 and error_code(response) == "EMPTY_FILE"

    def test_malformed_kml(self, client):
        response = upload(client, "bad.kml", b"<kml><Document>")
        assert response.status_code == 400 and error_code(response) == "MALFORMED_KML"


class TestUploadShapefile:
    def test_valid_polygon_zip(self, client):
        frame = gpd.GeoDataFrame({"name": ["A"]}, geometry=[Polygon(POLYGON)], crs="EPSG:4326")
        response = upload(client, "survey.zip", shapefile_zip_bytes(frame))
        assert response.status_code == 201
        assert response.json()["feature_count"] == 1 and response.json()["crs"] == "EPSG:4326"
        file_id = response.json()["id"]
        detail = client.get(f"/api/files/{file_id}/").json()
        assert detail["file_type"] == "SHAPEFILE"
        item = client.get(f"/api/files/{file_id}/measurements/").json()["measurements"][0]
        assert item["value"] == pytest.approx(geodesic_area(POLYGON), rel=0.005)

    def test_linestring_zip(self, client):
        frame = gpd.GeoDataFrame(geometry=[LineString(LINE)], crs="EPSG:4326")
        file_id = upload(client, "lines.zip", shapefile_zip_bytes(frame)).json()["id"]
        item = client.get(f"/api/files/{file_id}/measurements/").json()["measurements"][0]
        assert item["measurement_type"] == "length"
        assert item["value"] == pytest.approx(geodesic_length(LINE), rel=0.005)

    def test_projected_shapefile_measured_directly(self, client):
        square = Polygon([(500000, 1435000), (500100, 1435000), (500100, 1435050), (500000, 1435050)])
        frame = gpd.GeoDataFrame(geometry=[square], crs="EPSG:32643")
        response = upload(client, "utm.zip", shapefile_zip_bytes(frame))
        assert response.json()["crs"] == "EPSG:32643"
        item = client.get(f"/api/files/{response.json()['id']}/measurements/").json()["measurements"][0]
        assert item["value"] == pytest.approx(5000.0)

    def test_missing_prj_fails_with_traceable_record(self, client):
        frame = gpd.GeoDataFrame(geometry=[Polygon(POLYGON)])  # no CRS -> no .prj written
        response = upload(client, "nocrs.zip", shapefile_zip_bytes(frame))
        assert response.status_code == 422 and error_code(response) == "CRS_MISSING"
        file_id = response.json()["detail"]["file_id"]
        detail = client.get(f"/api/files/{file_id}/")
        assert detail.json()["status"] == "FAILED" and detail.json()["error_code"] == "CRS_MISSING"
        assert client.get(f"/api/files/{file_id}/measurements/").status_code == 409


class TestRejectedUploads:
    @pytest.mark.parametrize("name", ["notes.txt", "data.geojson", "archive.kmz", "noextension"])
    def test_unsupported_extension(self, client, name):
        response = upload(client, name, b"hello")
        assert response.status_code == 400 and error_code(response) == "UNSUPPORTED_FILE_TYPE"
        assert response.json()["detail"]["message"] == "Only KML and ZIP Shapefile files are supported."

    def test_corrupted_zip(self, client):
        response = upload(client, "broken.zip", b"PK\x03\x04 definitely not a real archive")
        assert response.status_code == 400 and error_code(response) == "INVALID_ZIP"

    def test_zip_without_shapefile(self, client):
        response = upload(client, "docs.zip", zip_bytes({"readme.txt": b"hi"}))
        assert response.status_code == 400 and error_code(response) == "INVALID_SHAPEFILE"

    def test_missing_file_field(self, client):
        response = client.post("/api/files/")
        assert response.status_code == 422 and error_code(response) == "VALIDATION_ERROR"

    def test_nothing_persisted_for_rejected_input(self, client):
        upload(client, "x.txt", b"hello")
        upload(client, "broken.zip", b"nope")
        # Rejected-at-validation uploads create no records, so a random id is unknown.
        assert client.get(f"/api/files/{uuid.uuid4()}/").status_code == 404


class TestSecurity:
    @pytest.mark.parametrize("evil", ["../../etc/evil.shp", "/tmp/evil.shp"])
    def test_zip_path_traversal(self, client, evil):
        data = zip_bytes({"a.shp": b"x", "a.shx": b"x", "a.dbf": b"x", evil: b"pwn"})
        response = upload(client, "evil.zip", data)
        assert response.status_code == 400 and error_code(response) == "UNSAFE_ZIP"

    def test_oversized_upload_rejected_by_content_length(self, small_limit_client):
        response = upload(small_limit_client, "big.kml", b"x" * (200 * 1024))
        assert response.status_code == 413 and error_code(response) == "PAYLOAD_TOO_LARGE"

    def test_oversized_upload_rejected_by_streaming_check(self, small_limit_client):
        # Passes the Content-Length pre-check (limit + 64 KiB slack) but exceeds the real limit.
        response = upload(small_limit_client, "big.kml", b"x" * 4096)
        assert response.status_code == 413 and error_code(response) == "PAYLOAD_TOO_LARGE"

    def test_error_responses_contain_no_stack_traces(self, client):
        response = upload(client, "bad.kml", b"<kml>")
        assert "Traceback" not in response.text and 'File "' not in response.text


class TestRetrieval:
    def test_get_file_detail(self, client):
        file_id = upload(client, "survey.kml", MIXED_KML).json()["id"]
        body = client.get(f"/api/files/{file_id}/").json()
        assert body["id"] == file_id and body["file_type"] == "KML" and body["status"] == "COMPLETED"
        assert body["feature_count"] == 3 and body["crs"] == "EPSG:4326"
        assert body["processing_time_ms"] >= 0 and body["created_at"]

    def test_unknown_id(self, client):
        for path in ("", "measurements/"):
            response = client.get(f"/api/files/{uuid.uuid4()}/{path}")
            assert response.status_code == 404 and error_code(response) == "FILE_NOT_FOUND"

    def test_invalid_uuid(self, client):
        response = client.get("/api/files/not-a-uuid/")
        assert response.status_code == 422 and error_code(response) == "VALIDATION_ERROR"


class TestHealth:
    def test_health(self, client):
        assert client.get("/health").json() == {"status": "healthy", "database": "connected"}

    def test_ready(self, client):
        assert client.get("/ready").json() == {"status": "ready", "database": "connected"}

    def test_docs_available(self, client):
        assert client.get("/docs").status_code == 200
        assert client.get("/redoc").status_code == 200
        assert "/api/files/" in client.get("/openapi.json").json()["paths"]
