import type { AnalysisResult, KeywordAnalysis, SectionAnalysis, SectionsResult } from "./types";
import { SECTION_ORDER } from "./types";

/**
 * These limits must exactly match the FastAPI backend's Pydantic validators.
 * If the backend changes them, update here — this is the only place the
 * frontend should hardcode these numbers.
 */
export const JD_MIN_CHARS = 50;
export const JD_MAX_CHARS = 8000;
export const RESUME_TEXT_MAX_CHARS = 15000;

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isSectionAnalysis(value: unknown): value is SectionAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isNumber(v.score) &&
    isString(v.feedback) &&
    (v.rewrite === null || isString(v.rewrite))
  );
}

function isSectionsResult(value: unknown): value is SectionsResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  // Every key that is one of the known section keys must have a valid shape.
  // Unknown extra keys are ignored rather than treated as a validation failure,
  // since the backend contract only promises sections "may not contain every
  // possible section" — it doesn't forbid it from adding new ones later.
  return SECTION_ORDER.every((key) => v[key] === undefined || isSectionAnalysis(v[key]));
}

function isKeywordAnalysis(value: unknown): value is KeywordAnalysis {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isStringArray(v.matched) &&
    isStringArray(v.missing_critical) &&
    isStringArray(v.missing_nice_to_have) &&
    isStringArray(v.overused)
  );
}

/**
 * Lightweight structural check — not a full schema library, just enough to
 * catch a corrupted or stale sessionStorage payload before it reaches the
 * results UI and throws mid-render.
 */
export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isNumber(v.overall_score) &&
    isString(v.verdict) &&
    isSectionsResult(v.sections) &&
    isKeywordAnalysis(v.keywords) &&
    isStringArray(v.ats_flags) &&
    isStringArray(v.quick_wins) &&
    (v.processing_time_ms === null || isNumber(v.processing_time_ms))
  );
}
