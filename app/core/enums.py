"""Domain enumerations shared by services, persistence and API schemas."""

from enum import StrEnum


class FileType(StrEnum):
    KML = "KML"
    SHAPEFILE = "SHAPEFILE"


class FileStatus(StrEnum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class MeasurementType(StrEnum):
    AREA = "area"
    LENGTH = "length"


class FeatureStatus(StrEnum):
    """Per-feature outcome. A bad feature never fails the whole file."""

    OK = "OK"
    REPAIRED = "REPAIRED"
    NULL_GEOMETRY = "NULL_GEOMETRY"
    EMPTY_GEOMETRY = "EMPTY_GEOMETRY"
    INVALID_GEOMETRY = "INVALID_GEOMETRY"
    UNSUPPORTED_GEOMETRY = "UNSUPPORTED_GEOMETRY"
    TRANSFORM_ERROR = "TRANSFORM_ERROR"
