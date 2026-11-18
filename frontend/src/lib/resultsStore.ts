import type { AnalysisResult } from "./types";
import { isAnalysisResult } from "./validation";

/**
 * State handoff between /analyze and /results.
 *
 * We deliberately avoid a global state library: the only requirement is that
 * a result produced on /analyze survives a client-side navigation to
 * /results, including a hard refresh of /results itself. sessionStorage
 * covers that without persisting anything once the tab closes, which keeps
 * resume content from lingering longer than the session needs it.
 */

const STORAGE_KEY = "hirelens:last-result";

export function saveResult(result: AnalysisResult): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // sessionStorage can fail (private browsing, quota) — the results page
    // will simply show its empty state, which is an acceptable fallback.
  }
}

export function loadResult(): AnalysisResult | null {
  if (typeof window === "undefined") return null;

  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearResult();
    return null;
  }

  if (!isAnalysisResult(parsed)) {
    clearResult();
    return null;
  }

  return parsed;
}

export function clearResult(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}
