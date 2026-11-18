from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    resume_text: str = Field(
        ...,
        min_length=50,
        max_length=15000,
        description="Plain text content of the resume",
    )
    job_description: str = Field(
        ...,
        min_length=50,
        max_length=8000,
        description="Plain text of the job description",
    )