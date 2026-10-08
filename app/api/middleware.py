"""Early rejection of oversized request bodies."""

from __future__ import annotations

from fastapi import FastAPI, Request

from app.api.errors import error_response

MULTIPART_OVERHEAD_BYTES = 64 * 1024


def add_body_size_limit(app: FastAPI, max_upload_bytes: int) -> None:
    """Reject by ``Content-Length`` before the multipart body is parsed.

    Requests without a Content-Length (chunked) are still caught by the streaming
    limit in ``save_stream_with_limit``. A reverse proxy limit is recommended too.
    """

    @app.middleware("http")
    async def limit_body_size(request: Request, call_next):
        length = request.headers.get("content-length")
        if (
            request.method in {"POST", "PUT", "PATCH"}
            and length is not None
            and length.isdigit()
            and int(length) > max_upload_bytes + MULTIPART_OVERHEAD_BYTES
        ):
            return error_response(413, "PAYLOAD_TOO_LARGE", "Upload exceeds the maximum allowed size.")
        return await call_next(request)
