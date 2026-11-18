"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScorePanel } from "@/components/results/ScorePanel";
import { SectionReport } from "@/components/results/SectionReport";
import { KeywordGroup } from "@/components/results/KeywordGroup";
import { AtsFlagsList } from "@/components/results/AtsFlagsList";
import { QuickWins } from "@/components/results/QuickWins";
import { ResultsEmptyState } from "@/components/results/ResultsEmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { loadResult } from "@/lib/resultsStore";
import { SECTION_LABELS, SECTION_ORDER, type AnalysisResult } from "@/lib/types";

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null | undefined>(undefined);

  useEffect(() => {
    // One-time client-only read of sessionStorage on mount. This intentionally
    // sets state directly in the effect (rather than deriving it during
    // render) to avoid an SSR/client hydration mismatch: sessionStorage isn't
    // available on the server, and reading it during render would either
    // throw or desync from the server-rendered markup.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(loadResult());
  }, []);

  // undefined = not yet checked (avoids an empty-state flash on first render)
  if (result === undefined) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  if (result === null) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <ResultsEmptyState />
        </main>
        <Footer />
      </div>
    );
  }

  const presentSections = SECTION_ORDER.filter((key) => result.sections[key]);
  const matchedCount = result.keywords.matched.length;
  const missingCriticalCount = result.keywords.missing_critical.length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-content px-6 py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your results</h1>
            <ButtonLink href="/analyze" variant="secondary">
              Run another analysis
            </ButtonLink>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
            <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              <ScorePanel
                score={result.overall_score}
                verdict={result.verdict}
                processingTimeMs={result.processing_time_ms}
              />
              <div className="rounded-md border border-line bg-surface p-6">
                <p className="text-sm font-medium text-ink">Match overview</p>
                <dl className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-ink-soft">Strong matches</dt>
                    <dd className="text-sm font-medium text-good">{matchedCount}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-ink-soft">Major gaps</dt>
                    <dd className="text-sm font-medium text-bad">{missingCriticalCount}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="space-y-14">
              {presentSections.length > 0 && (
                <section aria-labelledby="section-analysis-heading">
                  <h2 id="section-analysis-heading" className="text-lg font-semibold text-ink">
                    Section analysis
                  </h2>
                  <div className="mt-4">
                    {presentSections.map((key) => {
                      const analysis = result.sections[key];
                      if (!analysis) return null;
                      return (
                        <SectionReport key={key} label={SECTION_LABELS[key]} analysis={analysis} />
                      );
                    })}
                  </div>
                </section>
              )}

              <section aria-labelledby="keyword-analysis-heading">
                <h2 id="keyword-analysis-heading" className="text-lg font-semibold text-ink">
                  Keyword analysis
                </h2>
                <div className="mt-5 grid gap-8 sm:grid-cols-2">
                  <KeywordGroup
                    label="Matched"
                    description="Keywords from the job description found in your resume."
                    tone="good"
                    items={result.keywords.matched}
                  />
                  <KeywordGroup
                    label="Missing — critical"
                    description="Required keywords that don't appear in your resume."
                    tone="bad"
                    items={result.keywords.missing_critical}
                  />
                  <KeywordGroup
                    label="Missing — nice to have"
                    description="Keywords that would strengthen the match, if relevant."
                    tone="warn"
                    items={result.keywords.missing_nice_to_have}
                  />
                  <KeywordGroup
                    label="Overused"
                    description="Phrases repeated often enough to dilute their impact."
                    tone="neutral"
                    items={result.keywords.overused}
                  />
                </div>
              </section>

              <section aria-labelledby="ats-flags-heading">
                <h2 id="ats-flags-heading" className="text-lg font-semibold text-ink">
                  ATS flags
                </h2>
                <div className="mt-5">
                  <AtsFlagsList flags={result.ats_flags} />
                </div>
              </section>

              <section aria-labelledby="quick-wins-heading">
                <h2 id="quick-wins-heading" className="text-lg font-semibold text-ink">
                  Quick wins
                </h2>
                <div className="mt-5">
                  <QuickWins items={result.quick_wins} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
