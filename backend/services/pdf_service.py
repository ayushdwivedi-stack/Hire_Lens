from __future__ import annotations

import asyncio
import pymupdf


def _extract_text_sync(file_bytes: bytes) -> tuple[str, int]:
    """Synchronous PDF text extraction — runs in a thread pool."""
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Failed to open PDF: {exc}") from exc

    page_count = len(doc)
    text_parts = []

    for page in doc:
        text_parts.append(page.get_text())

    doc.close()
    text = "\n".join(text_parts).strip()

    if not text:
        raise ValueError(
            "No text could be extracted from this PDF. "
            "It may be a scanned image-based PDF. Please paste the resume text directly."
        )

    return text, page_count


async def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, int]:
    """
    Async wrapper around PyMuPDF extraction.
    Returns (extracted_text, page_count).
    """
    return await asyncio.to_thread(_extract_text_sync, file_bytes)
