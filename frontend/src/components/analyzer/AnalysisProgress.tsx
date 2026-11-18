import { ProgressStages } from "@/components/ui/ProgressStages";

export const ANALYSIS_STAGES = [
  { label: "Reading your resume…" },
  { label: "Comparing skills and requirements…" },
  { label: "Generating recommendations…" },
  { label: "Preparing your results…" },
];

export function AnalysisProgress({ activeIndex }: { activeIndex: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto max-w-sm rounded-md border border-line bg-surface p-8 text-center"
    >
      <p className="font-serif text-lg font-semibold text-ink">Analyzing your resume</p>
      <p className="mt-1.5 text-sm text-ink-soft">
        This usually takes under a minute, running locally.
      </p>
      <div className="mt-6 text-left">
        <ProgressStages stages={ANALYSIS_STAGES} activeIndex={activeIndex} />
      </div>
    </div>
  );
}
