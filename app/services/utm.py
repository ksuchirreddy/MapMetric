"""Pure-numpy UTM zone selection (no GIS dependencies, trivially unit-testable)."""

from __future__ import annotations

import numpy as np

UPS_NORTH_EPSG = 32661
UPS_SOUTH_EPSG = 32761
UPS_NORTH_MIN_LAT = 84.0  # UTM is defined for 80°S–84°N
UPS_SOUTH_MAX_LAT = -80.0


def utm_epsg_codes(lon: np.ndarray, lat: np.ndarray) -> np.ndarray:
    """Return the WGS 84 UTM (or UPS at the poles) EPSG code for each lon/lat pair.

    * Northern hemisphere: EPSG:326zz, southern: EPSG:327zz, zz = zone 1..60.
    * zone = floor((lon + 180) / 6) + 1, with longitude wrapped into [-180, 180).
    * Beyond 84°N / 80°S the UPS polar stereographic CRSs are used.
    The Norway/Svalbard zone exceptions are ignored: they change zone widths, not
    correctness, because any zone remains accurate for nearby geometry.
    """
    lon = np.asarray(lon, dtype=float)
    lat = np.asarray(lat, dtype=float)
    wrapped = ((lon + 180.0) % 360.0) - 180.0
    zone = np.clip(np.floor((wrapped + 180.0) / 6.0).astype(int) + 1, 1, 60)
    codes = np.where(lat >= 0, 32600, 32700) + zone
    codes = np.where(lat >= UPS_NORTH_MIN_LAT, UPS_NORTH_EPSG, codes)
    codes = np.where(lat < UPS_SOUTH_MAX_LAT, UPS_SOUTH_EPSG, codes)
    return codes


def utm_epsg(lon: float, lat: float) -> int:
    return int(utm_epsg_codes(np.array([lon]), np.array([lat]))[0])
