"""Persistence layer. All SQL lives here; services never build queries."""

from __future__ import annotations

import uuid
from collections.abc import Mapping, Sequence
from typing import Any

from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from app.core.enums import FileStatus
from app.db.models import FeatureRecord, FileRecord


class FileRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, *, filename: str, file_type: str) -> FileRecord:
        record = FileRecord(filename=filename, file_type=file_type, status=FileStatus.PROCESSING.value)
        self._session.add(record)
        self._session.commit()
        return record

    def get(self, file_id: uuid.UUID) -> FileRecord | None:
        return self._session.get(FileRecord, file_id)

    def add_features(
        self, file_id: uuid.UUID, rows: Sequence[Mapping[str, Any]], batch_size: int = 1000
    ) -> None:
        """Bulk-insert feature rows in batches (one INSERT per batch, no N+1)."""
        for start in range(0, len(rows), batch_size):
            batch = [{**row, "file_id": file_id} for row in rows[start : start + batch_size]]
            self._session.execute(insert(FeatureRecord), batch)

    def list_features(
        self, file_id: uuid.UUID, *, limit: int | None = None, offset: int = 0
    ) -> list[FeatureRecord]:
        stmt = (
            select(FeatureRecord)
            .where(FeatureRecord.file_id == file_id)
            .order_by(FeatureRecord.feature_index)
            .offset(offset)
        )
        if limit is not None:
            stmt = stmt.limit(limit)
        return list(self._session.scalars(stmt))

    def list_files(self, *, limit: int = 50, offset: int = 0) -> list[FileRecord]:
        stmt = (
            select(FileRecord)
            .order_by(FileRecord.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        return list(self._session.scalars(stmt))

    def commit(self) -> None:
        self._session.commit()

    def rollback(self) -> None:
        self._session.rollback()
