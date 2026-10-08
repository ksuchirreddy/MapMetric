"""CRS detection, UTM selection and projection behaviour."""

from __future__ import annotations

import geopandas as gpd
import numpy as np
import pytest
from pyproj import CRS
from shapely.geometry import Point, Polygon

from app.core.enums import FileType
from app.core.exceptions import InvalidCrsError, MissingCrsError
from app.services.crs_service import CRSService
from app.services.geospatial_service import GeospatialService
from app.services.utm import utm_epsg, utm_epsg_codes
from tests.factories import POLYGON, geodesic_area


class TestUtmSelection:
    @pytest.mark.parametrize(
        ("lon", "lat", "epsg"),
        [
            (77.59, 12.97, 32643),  # Bengaluru, northern hemisphere
            (-0.12, 51.5, 32630),  # London, just west of Greenwich
            (151.2, -33.9, 32756),  # Sydney, southern hemisphere
            (-74.0, 40.7, 32618),  # New York
            (179.9, 0.0, 32660),  # eastern edge of zone 60
            (-179.9, 0.0, 32601),  # western edge of zone 1
            (190.0, 10.0, 32602),  # 190°E wraps to -170°, which is zone 2
            (10.0, 85.0, 32661),  # UPS North
            (10.0, -85.0, 32761),  # UPS South
        ],
    )
    def test_zone_codes(self, lon, lat, epsg):
        assert utm_epsg(lon, lat) == epsg

    def test_vectorised(self):
        codes = utm_epsg_codes(np.array([77.59, 151.2]), np.array([12.97, -33.9]))
        assert codes.tolist() == [32643, 32756]


class TestDirectMeasurementCrs:
    @pytest.mark.parametrize(
        ("epsg", "direct"),
        [
            (32643, True),  # UTM, metres
            (27700, True),  # British National Grid, metres
            (4326, False),  # geographic
            (3857, False),  # Web Mercator distorts area badly
            (3395, False),  # World Mercator
            (2263, False),  # NY State Plane, US survey feet
        ],
    )
    def test_classification(self, epsg, direct):
        assert CRSService().is_direct_measurement_crs(CRS.from_epsg(epsg)) is direct


class TestDetectCrs:
    geo = GeospatialService()

    def test_wgs84(self):
        frame = gpd.GeoDataFrame(geometry=[Point(0, 0)], crs="EPSG:4326")
        assert self.geo.detect_crs(frame, FileType.SHAPEFILE).to_epsg() == 4326

    def test_projected(self):
        frame = gpd.GeoDataFrame(geometry=[Point(500000, 1435000)], crs="EPSG:32643")
        assert self.geo.detect_crs(frame, FileType.SHAPEFILE).to_epsg() == 32643

    def test_missing_crs_refused_for_shapefile(self):
        frame = gpd.GeoDataFrame(geometry=[Point(0, 0)])
        with pytest.raises(MissingCrsError):
            self.geo.detect_crs(frame, FileType.SHAPEFILE)

    def test_missing_crs_defaults_to_wgs84_for_kml(self):
        frame = gpd.GeoDataFrame(geometry=[Point(0, 0)])
        assert self.geo.detect_crs(frame, FileType.KML).to_epsg() == 4326

    def test_non_geographic_non_projected_crs_rejected(self):
        class FakeFrame:
            crs = CRS.from_epsg(4978)  # geocentric (X, Y, Z)

        with pytest.raises(InvalidCrsError):
            self.geo.detect_crs(FakeFrame(), FileType.SHAPEFILE)  # type: ignore[arg-type]

    def test_garbage_crs_rejected(self):
        class FakeFrame:
            crs = "definitely-not-a-crs"

        with pytest.raises(InvalidCrsError):
            self.geo.detect_crs(FakeFrame(), FileType.SHAPEFILE)  # type: ignore[arg-type]

    def test_format_crs(self):
        assert CRSService().format_crs(CRS.from_epsg(4326)) == "EPSG:4326"


class TestProjection:
    def test_geographic_polygon_projected_to_local_utm(self):
        series = gpd.GeoSeries([Polygon(POLYGON)], crs="EPSG:4326")
        result = CRSService().project_for_measurement(series)
        assert len(result.groups) == 1 and result.groups[0].crs.to_epsg() == 32643
        assert result.groups[0].geometries.area.iloc[0] == pytest.approx(geodesic_area(POLYGON), rel=0.005)

    def test_degree_area_is_nowhere_near_metres(self):
        # Guards the core requirement: raw EPSG:4326 .area is in degrees² (≈1e-6), not m².
        assert Polygon(POLYGON).area < 1e-5

    def test_features_in_different_zones_are_grouped_separately(self):
        series = gpd.GeoSeries(
            [Polygon(POLYGON), Polygon([(-0.1, 51.5), (-0.09, 51.5), (-0.09, 51.51), (-0.1, 51.5)])],
            crs="EPSG:4326",
        )
        result = CRSService().project_for_measurement(series)
        assert sorted(g.crs.to_epsg() for g in result.groups) == [32630, 32643]

    def test_projected_metre_crs_not_transformed(self):
        square = Polygon([(500000, 1435000), (500100, 1435000), (500100, 1435050), (500000, 1435050)])
        series = gpd.GeoSeries([square], crs="EPSG:32643")
        result = CRSService().project_for_measurement(series)
        assert result.groups[0].crs.to_epsg() == 32643
        assert result.groups[0].geometries.iloc[0].equals(square)

    def test_web_mercator_is_reprojected(self):
        series = gpd.GeoSeries([Polygon(POLYGON)], crs="EPSG:4326").to_crs(3857)
        result = CRSService().project_for_measurement(series)
        assert result.groups[0].crs.to_epsg() == 32643
        assert result.groups[0].geometries.area.iloc[0] == pytest.approx(geodesic_area(POLYGON), rel=0.005)

    def test_out_of_range_latitude_is_flagged_not_measured(self):
        series = gpd.GeoSeries([Polygon([(0, 95), (1, 95), (1, 96), (0, 95)])], crs="EPSG:4326")
        result = CRSService().project_for_measurement(series)
        assert result.failed_index == [0] and result.groups == []
