from fastapi import APIRouter, File, HTTPException, UploadFile

from ..config import settings
from ..schemas.responses import PdfParseResponse
from ..services.pdf_service import extract_text_from_pdf


router = APIRouter()


@router.post("/parse-pdf", response_model=PdfParseResponse)
async def parse_pdf(pdf: UploadFile = File(...)):
    if pdf.content_type not in (
        "application/pdf",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted.",
        )

    file_bytes = await pdf.read()

    if len(file_bytes) > settings.MAX_PDF_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"PDF exceeds the "
                f"{settings.MAX_PDF_BYTES // (1024 * 1024)} MB size limit."
            ),
        )

    try:
        text, page_count = await extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    return PdfParseResponse(
        text=text,
        page_count=page_count,
        char_count=len(text),
    )