"""Validation of untrusted uploads: names, size, KML content, safe ZIP extraction.

Everything here is framework-independent and raises ``AppError`` subclasses.
"""

from __future__ import annotations

import posixpath
import re
import zipfile
import zlib
from pathlib import Path, PurePosixPath
from typing import BinaryIO

from lxml import etree

from app.core.enums import FileType
from app.core.exceptions import (
    FileTooLargeError,
    InvalidShapefileError,
    InvalidZipError,
    MalformedKmlError,
    UnsafeZipError,
    UnsupportedFileTypeError,
)

ALLOWED_EXTENSIONS: dict[str, FileType] = {".kml": FileType.KML, ".zip": FileType.SHAPEFILE}
SHAPEFILE_PARTS = {".shp", ".shx", ".dbf", ".prj", ".cpg"}
REQUIRED_PARTS = (".shx", ".dbf")
SHP_FILE_CODE = 9994
CHUNK_SIZE = 1024 * 1024
RATIO_CHECK_MIN_BYTES = 1024 * 1024  # tiny files can legitimately compress extremely well

UNSUPPORTED_MESSAGE = "Only KML and ZIP Shapefile files are supported."


def validate_upload_name(filename: str | None) -> tuple[str, FileType]:
    """Return a sanitised display name and the file type, judged by extension."""
    if not filename or not filename.strip():
        raise UnsupportedFileTypeError(UNSUPPORTED_MESSAGE)
    safe_name = posixpath.basename(filename.replace("\\", "/")).strip()
    file_type = ALLOWED_EXTENSIONS.get(Path(safe_name).suffix.lower())
    if file_type is None:
        raise UnsupportedFileTypeError(UNSUPPORTED_MESSAGE)
    return safe_name[:255], file_type


def _format_bytes(num: int) -> str:
    return f"{num / (1024 * 1024):.0f} MB" if num >= 1024 * 1024 else f"{num} bytes"


def save_stream_with_limit(stream: BinaryIO, destination: Path, max_bytes: int) -> int:
    """Copy ``stream`` to ``destination`` in chunks, aborting once ``max_bytes`` is exceeded."""
    total = 0
    with destination.open("wb") as out:
        while chunk := stream.read(CHUNK_SIZE):
            total += len(chunk)
            if total > max_bytes:
                raise FileTooLargeError(
                    f"Upload exceeds the maximum allowed size of {_format_bytes(max_bytes)}."
                )
            out.write(chunk)
    return total


def validate_kml(path: Path) -> None:
    """Check the upload is well-formed KML without resolving entities or DTDs."""
    parser = etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False, huge_tree=False)
    try:
        tree = etree.parse(str(path), parser)
    except etree.LxmlError as exc:
        raise MalformedKmlError("The KML file is not well-formed XML.") from exc
    if tree.docinfo.doctype:
        raise MalformedKmlError("DOCTYPE declarations are not allowed in KML uploads.")
    if etree.QName(tree.getroot()).localname.lower() != "kml":
        raise MalformedKmlError("The XML document's root element must be <kml>.")


def _assert_safe_name(name: str) -> str:
    """Reject absolute paths, drive letters, NUL bytes and ``..`` segments."""
    if "\x00" in name:
        raise UnsafeZipError("Archive contains an entry with an illegal name.")
    normalized = name.replace("\\", "/")
    if normalized.startswith("/") or re.match(r"^[A-Za-z]:", normalized):
        raise UnsafeZipError("Archive contains an absolute path.")
    if ".." in normalized.split("/"):
        raise UnsafeZipError("Archive contains a path traversal entry ('..').")
    return normalized


def _is_symlink(info: zipfile.ZipInfo) -> bool:
    return (info.external_attr >> 16) & 0o170000 == 0o120000


def _is_junk(normalized_lower: str) -> bool:
    parts = PurePosixPath(normalized_lower).parts
    return bool(parts) and (parts[0] == "__macosx" or parts[-1].startswith("._"))


def _vet_members(
    infos: list[zipfile.ZipInfo], *, max_entries: int, max_uncompressed: int, max_ratio: int
) -> list[tuple[zipfile.ZipInfo, PurePosixPath]]:
    """Validate the whole archive up-front; return the shapefile parts worth extracting."""
    if len(infos) > max_entries:
        raise UnsafeZipError(f"Archive contains too many entries (limit {max_entries}).")
    members: list[tuple[zipfile.ZipInfo, PurePosixPath]] = []
    total = 0
    for info in infos:
        normalized = _assert_safe_name(info.filename)
        if info.is_dir():
            continue
        if _is_symlink(info):
            raise UnsafeZipError("Archive contains a symbolic link.")
        lowered = normalized.lower()
        if _is_junk(lowered):
            continue
        total += info.file_size
        if total > max_uncompressed:
            raise UnsafeZipError("Archive expands beyond the allowed size (possible ZIP bomb).")
        if (
            info.file_size > RATIO_CHECK_MIN_BYTES
            and info.compress_size > 0
            and info.file_size / info.compress_size > max_ratio
        ):
            raise UnsafeZipError("Archive has a suspicious compression ratio (possible ZIP bomb).")
        relative = PurePosixPath(lowered)
        if relative.suffix in SHAPEFILE_PARTS:
            members.append((info, relative))
    return members


def _extract_members(
    archive: zipfile.ZipFile,
    members: list[tuple[zipfile.ZipInfo, PurePosixPath]],
    dest_dir: Path,
    max_uncompressed: int,
) -> None:
    dest_root = dest_dir.resolve()
    dest_root.mkdir(parents=True, exist_ok=True)
    written_total = 0
    for info, relative in members:
        target = (dest_root / relative).resolve()
        if not target.is_relative_to(dest_root):  # defence in depth after name checks
            raise UnsafeZipError("Archive entry would be written outside the extraction directory.")
        if target.exists():
            raise UnsafeZipError("Archive contains duplicate entry names.")
        target.parent.mkdir(parents=True, exist_ok=True)
        with archive.open(info) as src, target.open("wb") as out:
            # Count real bytes: headers can lie about file_size.
            while chunk := src.read(CHUNK_SIZE):
                written_total += len(chunk)
                if written_total > max_uncompressed:
                    raise UnsafeZipError("Archive expands beyond the allowed size (possible ZIP bomb).")
                out.write(chunk)


def _locate_shapefile(dest_dir: Path) -> Path:
    shp_files = sorted(p for p in dest_dir.rglob("*") if p.is_file() and p.suffix == ".shp")
    if not shp_files:
        raise InvalidShapefileError("The ZIP archive does not contain a .shp file.")
    if len(shp_files) > 1:
        raise InvalidShapefileError(
            "The ZIP archive contains more than one Shapefile; upload one Shapefile per ZIP."
        )
    shp = shp_files[0]
    for ext in REQUIRED_PARTS:
        if not shp.with_suffix(ext).is_file():
            raise InvalidShapefileError(f"The Shapefile is missing its required {ext} component.")
    with shp.open("rb") as handle:
        header = handle.read(4)
    if len(header) < 4 or int.from_bytes(header, "big") != SHP_FILE_CODE:
        raise InvalidShapefileError("The .shp file is not a valid Shapefile.")
    return shp


def extract_shapefile_zip(
    zip_path: Path,
    dest_dir: Path,
    *,
    max_entries: int,
    max_uncompressed: int,
    max_ratio: int,
) -> Path:
    """Safely extract a Shapefile ZIP into ``dest_dir`` and return the ``.shp`` path.

    Only Shapefile component files are extracted, names are lower-cased, and the
    whole archive is rejected if any entry is unsafe.
    """
    if not zipfile.is_zipfile(zip_path):
        raise InvalidZipError("The uploaded file is not a valid ZIP archive.")
    try:
        with zipfile.ZipFile(zip_path) as archive:
            members = _vet_members(
                archive.infolist(),
                max_entries=max_entries,
                max_uncompressed=max_uncompressed,
                max_ratio=max_ratio,
            )
            _extract_members(archive, members, dest_dir, max_uncompressed)
    except (zipfile.BadZipFile, zlib.error, EOFError, NotImplementedError, RuntimeError) as exc:
        # RuntimeError covers encrypted members; NotImplementedError exotic compression.
        raise InvalidZipError(
            "The ZIP archive is corrupted, encrypted or uses unsupported compression."
        ) from exc
    return _locate_shapefile(dest_dir)
