export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMs(ms: number | null): string | null {
  if (ms === null || Number.isNaN(ms)) return null;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/** Score bands shared between the score dial and section scores. */
export type ScoreBand = "good" | "warn" | "bad";

export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return "good";
  if (score >= 50) return "warn";
  return "bad";
}
