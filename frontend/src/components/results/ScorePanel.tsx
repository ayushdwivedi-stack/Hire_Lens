import { cx, formatMs, scoreBand } from "@/lib/utils";

const bandStyles = {
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
} as const;

export function ScorePanel({
  score,
  verdict,
  processingTimeMs,
}: {
  score: number;
  verdict: string;
  processingTimeMs: number | null;
}) {
  const band = scoreBand(score);
  const formattedTime = formatMs(processingTimeMs);

  return (
    <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
      <p className="text-sm text-ink-soft">ATS compatibility</p>
      <div className="mt-2 flex items-baseline gap-3">
        <span className={cx("font-serif text-6xl font-semibold leading-none", bandStyles[band])}>
          {Math.round(score)}
        </span>
        <span className="text-lg text-ink-faint">/ 100</span>
      </div>
      <p className="mt-4 max-w-[46ch] text-ink">{verdict}</p>
      {formattedTime && (
        <p className="mt-4 text-xs text-ink-faint">Analyzed in {formattedTime}</p>
      )}
    </div>
  );
}
