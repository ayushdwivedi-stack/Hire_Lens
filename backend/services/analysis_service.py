import time

from ..config import settings
from ..schemas.responses import AnalysisResult
from .openai_service import _ai_service


async def analyze(resume_text: str, job_description: str) -> AnalysisResult:
    """
    Orchestrate resume vs JD analysis.
    Validates input lengths, calls the configured AI provider,
    validates and returns the result.
    """
    resume_text = resume_text.strip()
    job_description = job_description.strip()

    if len(resume_text) > settings.MAX_RESUME_CHARS:
        resume_text = resume_text[: settings.MAX_RESUME_CHARS]

    if len(job_description) > settings.MAX_JD_CHARS:
        job_description = job_description[: settings.MAX_JD_CHARS]

    start = time.monotonic()

    raw = await _ai_service.analyze(
        resume_text,
        job_description,
    )

    elapsed_ms = int((time.monotonic() - start) * 1000)

    result = AnalysisResult.model_validate(raw)
    result.processing_time_ms = elapsed_ms

    return result