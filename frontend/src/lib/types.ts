/**
 * Types mirror the FastAPI response contract exactly.
 * Keep this file in sync with the backend's Pydantic models.
 */

export type SectionKey = "summary" | "experience" | "skills" | "education";

export interface SectionAnalysis {
  score: number;
  feedback: string;
  rewrite: string | null;
}

/**
 * The backend may omit any section, so this is a partial record.
 * Always render sections dynamically from whatever keys are present.
 */
export type SectionsResult = Partial<Record<SectionKey, SectionAnalysis>>;

export interface KeywordAnalysis {
  matched: string[];
  missing_critical: string[];
  missing_nice_to_have: string[];
  overused: string[];
}

export interface AnalysisResult {
  overall_score: number;
  verdict: string;
  sections: SectionsResult;
  keywords: KeywordAnalysis;
  ats_flags: string[];
  quick_wins: string[];
  processing_time_ms: number | null;
}

export interface AnalyzeTextPayload {
  resume_text: string;
  job_description: string;
}

export interface HealthResponse {
  status: string;
  [key: string]: unknown;
}

/** Human-readable labels for each section, used since the backend key is machine-facing. */
export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
};

/** Order in which sections should render when present. */
export const SECTION_ORDER: SectionKey[] = [
  "summary",
  "experience",
  "skills",
  "education",
];
