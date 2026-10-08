from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Query, UploadFile, status

from app.api.deps import get_file_service
from app.db.models import FeatureRecord
from app.schemas.error import ErrorResponse
from app.schemas.file import FileDetailResponse, FileUploadResponse
from app.schemas.measurement import MeasurementItem, MeasurementsResponse
from app.services.file_service import FileService

router = APIRouter(prefix="/api/files", tags=["files"])

_UPLOAD_ERRORS = {
    400: {
        "model": ErrorResponse,
        "description": "Invalid input: unsupported type, empty file, malformed KML, invalid or "
        "unsafe ZIP, or no valid Shapefile inside the ZIP.",
    },
    413: {"model": ErrorResponse, "description": "Upload exceeds the configured size limit."},
    422: {
        "model": ErrorResponse,
        "description": "Well-formed upload but unusable data: missing/invalid CRS or corrupted "
        "geospatial content (a FAILED file record is kept; its id is in the error body).",
    },
    500: {"model": ErrorResponse, "description": "Unexpected server error."},
}
_NOT_FOUND = {404: {"model": ErrorResponse, "description": "No file exists with that id."}}


@router.post(
    "/",
    response_model=FileUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload and process a geospatial file",
    responses=_UPLOAD_ERRORS,
)
def upload_file(
    file: UploadFile = File(..., description="A `.kml` file or a `.zip` containing a Shapefile."),
    service: FileService = Depends(get_file_service),
) -> FileUploadResponse:
    """Validate the upload, extract features, detect the CRS, measure each feature in a
    metric projected CRS and persist the results. Processing is synchronous."""
    record = service.process_upload(file.file, file.filename)
    return FileUploadResponse.model_validate(record)


@router.get(
    "/list",
    response_model=list[FileDetailResponse],
    summary="List recent uploaded files",
)
def list_files(
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    service: FileService = Depends(get_file_service),
) -> list[FileDetailResponse]:
    records = service.list_recent_files(limit=limit, offset=offset)
    return [FileDetailResponse.model_validate(r) for r in records]


@router.get(
    "/{file_id}/",
    response_model=FileDetailResponse,
    summary="Get file metadata and processing status",
    responses=_NOT_FOUND,
)
def get_file(file_id: uuid.UUID, service: FileService = Depends(get_file_service)) -> FileDetailResponse:
    return FileDetailResponse.model_validate(service.get_file(file_id))


def _to_item(feature: FeatureRecord, include_properties: bool) -> MeasurementItem:
    return MeasurementItem(
        feature_id=feature.feature_index,
        geometry_type=feature.geometry_type,
        measurement_type=feature.measurement_type,
        value=feature.measurement_value,
        unit=feature.measurement_unit,
        status=feature.processing_status,
        error_message=feature.error_message,
        properties=feature.properties if include_properties else None,
    )


@router.get(
    "/{file_id}/measurements/",
    response_model=MeasurementsResponse,
    summary="Get per-feature measurements",
    responses={
        **_NOT_FOUND,
        409: {"model": ErrorResponse, "description": "File processing did not complete."},
    },
)
def get_measurements(
    file_id: uuid.UUID,
    include_properties: bool = Query(False, description="Also return each feature's attributes."),
    limit: int | None = Query(None, ge=1, le=100_000, description="Max features to return."),
    offset: int = Query(0, ge=0, description="Features to skip (for pagination)."),
    service: FileService = Depends(get_file_service),
) -> MeasurementsResponse:
    """Area (m²) for polygons, length (m) for lines. Points and problematic features are
    returned with a null measurement and an explanatory per-feature `status`."""
    record, features = service.get_measurements(file_id, limit=limit, offset=offset)
    return MeasurementsResponse(
        file_id=record.id,
        total=record.feature_count,
        measurements=[_to_item(f, include_properties) for f in features],
    )
