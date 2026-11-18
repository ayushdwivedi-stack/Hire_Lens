import { cx, scoreBand } from "@/lib/utils";
import type { SectionAnalysis } from "@/lib/types";

const dotStyles = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
} as const;

export function SectionReport({ label, analysis }: { label: string; analysis: SectionAnalysis }) {
  const band = scoreBand(analysis.score);

  return (
    <div className="border-b border-line py-6 first:pt-0 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-serif text-lg font-semibold text-ink">{label}</h3>
        <div className="flex items-center gap-2">
          <span aria-hidden className={cx("h-1.5 w-1.5 rounded-full", dotStyles[band])} />
          <span className="text-sm text-ink-soft">{Math.round(analysis.score)} / 100</span>
        </div>
      </div>
      <p className="mt-3 leading-relaxed text-ink-soft">{analysis.feedback}</p>
      {analysis.rewrite && (
        <div className="mt-4 rounded-md border border-line bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
            Suggested rewrite
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
            {analysis.rewrite}
          </p>
        </div>
      )}
    </div>
  );
}
