import { ButtonLink } from "@/components/ui/Button";

export function ResultsEmptyState() {
  return (
    <div className="mx-auto max-w-md rounded-md border border-line bg-surface px-8 py-12 text-center">
      <h1 className="font-serif text-xl font-semibold text-ink">No analysis to show</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Results are only kept for your current session. Run a new analysis to see your match.
      </p>
      <div className="mt-6">
        <ButtonLink href="/analyze">Analyze a resume</ButtonLink>
      </div>
    </div>
  );
}
