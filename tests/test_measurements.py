"""MeasurementService behaviour on in-memory features."""

from __future__ import annotations

import pytest
from pyproj import CRS
from shapely.geometry import (
    GeometryCollection,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
)

from app.core.enums import FeatureStatus, MeasurementType
from app.services.crs_service import CRSService
from app.services.geometry_validation import check_geometry
from app.services.measurement_service import MeasurementService
from app.services.types import ExtractedFeature
from tests.factories import LINE, POINT, POLYGON, geodesic_area, geodesic_length

WGS84 = CRS.from_epsg(4326)


def feature(index, geometry):
    check = check_geometry(geometry)
    return ExtractedFeature(
        index=index,
        geometry_type=geometry.geom_type if geometry is not None else None,
        geometry=check.geometry,
        status=check.status,
        message=check.message,
    )


def measure(geometries, crs=WGS84, **kwargs):
    service = MeasurementService(CRSService(), **kwargs)
    return service.measure([feature(i, g) for i, g in enumerate(geometries)], crs)


def test_polygon_area_in_square_metres():
    (result,) = measure([Polygon(POLYGON)])
    assert result.measurement_type is MeasurementType.AREA and result.unit == "m²"
    assert result.status is FeatureStatus.OK
    assert result.value == pytest.approx(geodesic_area(POLYGON), rel=0.005)


def test_linestring_length_in_metres():
    (result,) = measure([LineString(LINE)])
    assert result.measurement_type is MeasurementType.LENGTH and result.unit == "m"
    assert result.value == pytest.approx(geodesic_length(LINE), rel=0.005)


def test_point_has_no_measurement():
    (result,) = measure([Point(POINT)])
    assert (result.measurement_type, result.value, result.unit) == (None, None, None)
    assert result.status is FeatureStatus.OK and result.geometry_type == "Point"


def test_geometry_collection_unsupported_does_not_crash():
    collection = GeometryCollection([Point(0, 0), LineString([(0, 0), (1, 1)])])
    (result,) = measure([collection])
    assert result.status is FeatureStatus.UNSUPPORTED_GEOMETRY
    assert result.value is None and result.measurement_type is None
    assert "GeometryCollection" in result.message


def test_multi_geometries_supported_as_enhancement():
    two_squares = MultiPolygon([Polygon(POLYGON), Polygon([(x + 0.01, y) for x, y in POLYGON])])
    multi_line = MultiLineString([LINE, [(x + 0.01, y) for x, y in LINE]])
    area, length, multipoint = measure([two_squares, multi_line, MultiPoint([POINT, (77.6, 12.98)])])
    assert area.value == pytest.approx(2 * geodesic_area(POLYGON), rel=0.005)
    assert length.value == pytest.approx(2 * geodesic_length(LINE), rel=0.005)
    assert multipoint.value is None and multipoint.status is FeatureStatus.OK


def test_multi_geometries_unsupported_when_disabled():
    results = measure(
        [MultiPolygon([Polygon(POLYGON)]), MultiLineString([LINE]), MultiPoint([POINT])],
        support_multi_geometries=False,
    )
    assert all(r.status is FeatureStatus.UNSUPPORTED_GEOMETRY and r.value is None for r in results)


def test_one_bad_feature_does_not_affect_others():
    bowtie = Polygon([(77.59, 12.97), (77.591, 12.971), (77.591, 12.97), (77.59, 12.971), (77.59, 12.97)])
    results = measure([None, Polygon(), bowtie, Polygon(POLYGON), Polygon([(0, 0), (1, 1), (2, 2), (0, 0)])])
    assert [r.status for r in results] == [
        FeatureStatus.NULL_GEOMETRY,
        FeatureStatus.EMPTY_GEOMETRY,
        FeatureStatus.REPAIRED,
        FeatureStatus.OK,
        FeatureStatus.INVALID_GEOMETRY,
    ]
    assert results[2].value and results[2].value > 0
    assert results[3].value == pytest.approx(geodesic_area(POLYGON), rel=0.005)
    assert [r.index for r in results] == [0, 1, 2, 3, 4]


def test_projected_crs_measures_directly():
    square = Polygon([(500000, 1435000), (500100, 1435000), (500100, 1435050), (500000, 1435050)])
    line = LineString([(500000, 1435000), (500300, 1435400)])
    area, length = measure([square, line], crs=CRS.from_epsg(32643))
    assert area.value == pytest.approx(5000.0)
    assert length.value == pytest.approx(500.0)


def test_features_in_different_utm_zones_measured_independently():
    london = Polygon([(-0.1, 51.5), (-0.099, 51.5), (-0.099, 51.501), (-0.1, 51.501)])
    bengaluru = Polygon(POLYGON)
    a, b = measure([london, bengaluru])
    london_coords = list(london.exterior.coords)
    assert a.value == pytest.approx(geodesic_area(london_coords), rel=0.005)
    assert b.value == pytest.approx(geodesic_area(POLYGON), rel=0.005)


def test_out_of_range_coordinates_flagged_as_transform_error():
    (result,) = measure([Polygon([(0, 95), (1, 95), (1, 96), (0, 95)])])
    assert result.status is FeatureStatus.TRANSFORM_ERROR and result.value is None
