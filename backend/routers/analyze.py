from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..config import settings
from ..schemas.requests import AnalysisRequest
from ..schemas.responses import AnalysisResult
from ..services import analysis_service
from ..services.pdf_service import extract_text_from_pdf

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResult)
async def analyze(
    resume_file: Optional[UploadFile] = File(default=None),
    job_description: Optional[str] = Form(default=None),
):
    """
    Analyze a PDF resume against a job description.
    """

    if resume_file is None:
        raise HTTPException(
            status_code=422,
            detail="Provide a resume_file (PDF).",
        )

    if not job_description or len(job_description.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail="job_description must be at least 50 characters.",
        )

    if len(job_description) > settings.MAX_JD_CHARS:
        raise HTTPException(
            status_code=422,
            detail=(
                f"job_description must not exceed "
                f"{settings.MAX_JD_CHARS} characters."
            ),
        )

    if resume_file.content_type not in (
        "application/pdf",
        "application/octet-stream",
    ):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted.",
        )

    file_bytes = await resume_file.read()

    if len(file_bytes) > settings.MAX_PDF_BYTES:
        raise HTTPException(
            status_code=413,
            detail=(
                f"PDF exceeds the "
                f"{settings.MAX_PDF_BYTES // (1024 * 1024)} MB size limit."
            ),
        )

    try:
        resume_text, _ = await extract_text_from_pdf(file_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    try:
        result = await analysis_service.analyze(
            resume_text,
            job_description,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    return result


@router.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text(body: AnalysisRequest):
    """
    Analyze plain-text resume content against a job description.
    """

    try:
        result = await analysis_service.analyze(
            body.resume_text,
            body.job_description,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    return result
