from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class SectionResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    feedback: str
    rewrite: Optional[str] = None


class KeywordAnalysis(BaseModel):
    matched: List[str] = Field(default_factory=list)
    missing_critical: List[str] = Field(default_factory=list)
    missing_nice_to_have: List[str] = Field(default_factory=list)
    overused: List[str] = Field(default_factory=list)


class AnalysisResult(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    verdict: str
    sections: Dict[str, SectionResult]
    keywords: KeywordAnalysis
    ats_flags: List[str] = Field(default_factory=list)
    quick_wins: List[str] = Field(default_factory=list)
    processing_time_ms: Optional[int] = None


class PdfParseResponse(BaseModel):
    text: str
    page_count: int
    char_count: int


class HealthResponse(BaseModel):
    status: str
    version: str