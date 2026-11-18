import type { AnalysisResult, AnalyzeTextPayload, HealthResponse } from "./types";
import { JD_MAX_CHARS, JD_MIN_CHARS, RESUME_TEXT_MAX_CHARS } from "./validation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "https://admission-transparency-building-problems.trycloudflare.com";

/**
 * The backend runs analysis through a local Ollama model, which can
 * legitimately take longer than a typical HTTP request. The local
 * configuration's own generation timeout can run up to ~300s under load, so a
 * frontend timeout shorter than that would give up on requests the backend
 * is still actively completing. 5 minutes gives the backend its full budget
 * plus a small margin for network/queueing overhead, while still failing the
 * request eventually rather than hanging forever if something is genuinely
 * stuck.
 */
const ANALYZE_TIMEOUT_MS = 5 * 60_000 + 15_000; // 315s

export type ApiErrorKind = "network" | "timeout" | "validation" | "server" | "unknown";

/**
 * A single error type for every API failure, carrying a message that is
 * already safe to show directly to a non-technical user.
 */
export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

async function withTimeout<T>(
  promiseFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await promiseFactory(controller.signal);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "timeout",
        "This is taking longer than expected. The analysis may still be running — please try again in a moment."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function parseErrorResponse(res: Response): Promise<never> {
  let detail = "";
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "detail" in body) {
      const rawDetail = (body as { detail: unknown }).detail;
      detail = typeof rawDetail === "string" ? rawDetail : JSON.stringify(rawDetail);
    }
  } catch {
    // response wasn't JSON — fall through with no detail
  }

  if (res.status === 422) {
    throw new ApiError(
      "validation",
      detail || "Hirelens couldn't read that submission. Double-check the file and job description, then try again."
    );
  }

  if (res.status >= 500) {
    throw new ApiError(
      "server",
      "Hirelens ran into a problem while analyzing your resume. Please try again."
    );
  }

  throw new ApiError("unknown", detail || "Something went wrong. Please try again.");
}

function toNetworkError(): ApiError {
  return new ApiError(
    "network",
    "Couldn't connect to Hirelens. Please make sure the backend is running and try again."
  );
}

export async function checkHealth(): Promise<HealthResponse> {
  let res: Response;
  try {
    res = await withTimeout(
      (signal) => fetch(`${API_BASE_URL}/api/health`, { signal, cache: "no-store" }),
      8_000
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw toNetworkError();
  }

  if (!res.ok) {
    throw new ApiError(
      "server",
      "Hirelens backend responded, but reported it isn't healthy right now.",
      res.status
    );
  }

  try {
    return (await res.json()) as HealthResponse;
  } catch {
    throw new ApiError(
      "unknown",
      "Hirelens backend returned an unexpected response to the health check."
    );
  }
}

function validateJobDescription(jobDescription: string): void {
  const length = jobDescription.trim().length;
  if (length < JD_MIN_CHARS) {
    throw new ApiError(
      "validation",
      `The job description is too short. Add at least ${JD_MIN_CHARS} characters.`
    );
  }
  if (length > JD_MAX_CHARS) {
    throw new ApiError(
      "validation",
      `The job description is too long. Keep it under ${JD_MAX_CHARS.toLocaleString()} characters.`
    );
  }
}

export async function analyzeResumeFile(
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> {
  validateJobDescription(jobDescription);

  const formData = new FormData();
  formData.append("resume_file", resumeFile);
  formData.append("job_description", jobDescription);

  let res: Response;
  try {
    res = await withTimeout(
      (signal) =>
        fetch(`${API_BASE_URL}/api/analyze`, {
          method: "POST",
          body: formData,
          signal,
        }),
      ANALYZE_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw toNetworkError();
  }

  if (!res.ok) await parseErrorResponse(res);
  return (await res.json()) as AnalysisResult;
}

export async function analyzeResumeText(
  payload: AnalyzeTextPayload
): Promise<AnalysisResult> {
  validateJobDescription(payload.job_description);
  if (payload.resume_text.length > RESUME_TEXT_MAX_CHARS) {
    throw new ApiError(
      "validation",
      `The resume text is too long. Keep it under ${RESUME_TEXT_MAX_CHARS.toLocaleString()} characters.`
    );
  }

  let res: Response;
  try {
    res = await withTimeout(
      (signal) =>
        fetch(`${API_BASE_URL}/api/analyze-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal,
        }),
      ANALYZE_TIMEOUT_MS
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw toNetworkError();
  }

  if (!res.ok) await parseErrorResponse(res);
  return (await res.json()) as AnalysisResult;
}

export { API_BASE_URL };
