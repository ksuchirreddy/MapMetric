"""Orchestrates an upload: validate -> store temporarily -> process -> persist."""

from __future__ import annotations

import logging
import tempfile
import time
import uuid
from pathlib import Path
from typing import BinaryIO

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.enums import FileStatus, FileType
from app.core.exceptions import (
    AppError,
    EmptyFileError,
    FileNotCompletedError,
    FileNotFoundInStoreError,
    ProcessingError,
)
from app.db.models import FeatureRecord, FileRecord
from app.db.repositories import FileRepository
from app.services.crs_service import CRSService
from app.services.geospatial_service import GeospatialService
from app.services.measurement_service import MeasurementService
from app.services.types import FeatureResult
from app.utils.file_validation import (
    extract_shapefile_zip,
    save_stream_with_limit,
    validate_kml,
    validate_upload_name,
)

logger = logging.getLogger(__name__)


class FileService:
    def __init__(
        self,
        *,
        session: Session,
        settings: Settings,
        geospatial: GeospatialService,
        measurement: MeasurementService,
        crs_service: CRSService,
    ) -> None:
        self._repo = FileRepository(session)
        self._settings = settings
        self._geo = geospatial
        self._measurement = measurement
        self._crs = crs_service

    # -- upload ----------------------------------------------------------
    def process_upload(self, stream: BinaryIO, filename: str | None) -> FileRecord:
        """Validate and process an upload synchronously.

        Input-validation failures raise without persisting anything. Once the
        input is accepted a ``files`` row is created so any later failure is
        recorded (status FAILED) and traceable by id. ``_process`` is the single
        seam where background execution could be introduced later.
        """
        logger.info("upload_received", extra={"upload_filename": filename})
        safe_name, file_type = validate_upload_name(filename)

        with tempfile.TemporaryDirectory(prefix="geo-upload-") as tmp:
            workdir = Path(tmp)
            upload_path = workdir / f"upload.{file_type.value.lower()}"
            size = save_stream_with_limit(stream, upload_path, self._settings.max_upload_size_bytes)
            if size == 0:
                raise EmptyFileError("The uploaded file is empty.")
            dataset_path = self._prepare_dataset(file_type, upload_path, workdir)
            logger.info(
                "file_validated",
                extra={"upload_filename": safe_name, "file_type": file_type.value, "size_bytes": size},
            )
            record = self._repo.create(filename=safe_name, file_type=file_type.value)
            return self._process(record, dataset_path, file_type)

    def _prepare_dataset(self, file_type: FileType, upload_path: Path, workdir: Path) -> Path:
        if file_type is FileType.KML:
            validate_kml(upload_path)
            return upload_path
        return extract_shapefile_zip(
            upload_path,
            workdir / "extracted",
            max_entries=self._settings.max_zip_entries,
            max_uncompressed=self._settings.max_uncompressed_size_bytes,
            max_ratio=self._settings.max_compression_ratio,
        )

    def _process(self, record: FileRecord, path: Path, file_type: FileType) -> FileRecord:
        started = time.perf_counter()
        extra = {"file_id": str(record.id)}
        crs_label: str | None = None
        try:
            logger.info("processing_started", extra=extra)
            frame = self._geo.read_file(path, file_type)
            crs = self._geo.detect_crs(frame, file_type)
            crs_label = self._crs.format_crs(crs)
            logger.info("crs_detected", extra={**extra, "crs": crs_label})
            features = self._geo.extract_features(frame)
            logger.info("features_extracted", extra={**extra, "feature_count": len(features)})
            results = self._measurement.measure(features, crs)

            self._repo.add_features(
                record.id, [self._to_row(r) for r in results], self._settings.insert_batch_size
            )
            record.original_crs = crs_label
            record.feature_count = len(results)
            record.status = FileStatus.COMPLETED.value
            record.processing_time_ms = int((time.perf_counter() - started) * 1000)
            self._repo.commit()
            logger.info(
                "processing_completed",
                extra={**extra, "feature_count": len(results), "duration_ms": record.processing_time_ms},
            )
            return record
        except AppError as exc:
            self._mark_failed(record, exc.code, exc.message, crs_label, started)
            exc.file_id = record.id
            raise
        except SQLAlchemyError:
            self._mark_failed(record, "DATABASE_ERROR", "A database error occurred.", crs_label, started)
            raise
        except Exception as exc:
            self._mark_failed(
                record, ProcessingError.code, "Unexpected processing error.", crs_label, started
            )
            raise ProcessingError("The file could not be processed.", file_id=record.id) from exc

    @staticmethod
    def _to_row(result: FeatureResult) -> dict:
        return {
            "feature_index": result.index,
            "geometry_type": result.geometry_type,
            "properties": result.properties,
            "measurement_type": result.measurement_type.value if result.measurement_type else None,
            "measurement_value": result.value,
            "measurement_unit": result.unit,
            "processing_status": result.status.value,
            "error_message": result.message,
        }

    def _mark_failed(
        self, record: FileRecord, code: str, message: str, crs_label: str | None, started: float
    ) -> None:
        extra = {"file_id": str(record.id), "error_code": code}
        logger.error("processing_failed", extra=extra, exc_info=True)
        try:
            self._repo.rollback()
            record.status = FileStatus.FAILED.value
            record.error_code = code
            record.error_message = message
            record.original_crs = crs_label
            record.processing_time_ms = int((time.perf_counter() - started) * 1000)
            self._repo.commit()
        except SQLAlchemyError:
            self._repo.rollback()
            logger.error("failed_to_record_failure", extra=extra, exc_info=True)

    # -- queries ---------------------------------------------------------
    def get_file(self, file_id: uuid.UUID) -> FileRecord:
        record = self._repo.get(file_id)
        if record is None:
            raise FileNotFoundInStoreError(f"No file found with id {file_id}.")
        return record

    def get_measurements(
        self, file_id: uuid.UUID, *, limit: int | None = None, offset: int = 0
    ) -> tuple[FileRecord, list[FeatureRecord]]:
        record = self.get_file(file_id)
        if record.status != FileStatus.COMPLETED.value:
            raise FileNotCompletedError(
                f"File processing is {record.status}; measurements are only available once COMPLETED."
            )
        return record, self._repo.list_features(file_id, limit=limit, offset=offset)
