import { ButtonLink } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="mx-auto max-w-content px-6 pb-20 pt-16 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[1fr_0.95fr] lg:items-start">
        <div>
          <h1 className="max-w-[16ch] text-4xl font-semibold leading-[1.1] tracking-tight sm:text-[2.75rem]">
            See how closely your resume matches the job.
          </h1>
          <p className="mt-6 max-w-prose text-lg leading-relaxed text-ink-soft">
            Upload your resume. Paste the job description. Hirelens reads both and shows you
            exactly where they line up — and where they don&apos;t.
          </p>

          <ol className="mt-8 space-y-2.5 text-[0.95rem] text-ink-soft">
            <li className="flex gap-3">
              <span className="text-ink-faint">1.</span> Upload your resume.
            </li>
            <li className="flex gap-3">
              <span className="text-ink-faint">2.</span> Paste the job description.
            </li>
            <li className="flex gap-3">
              <span className="text-ink-faint">3.</span> Review the match.
            </li>
          </ol>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="/analyze">Analyze resume</ButtonLink>
            <ButtonLink href="/#how-it-works" variant="ghost">
              See how it works
            </ButtonLink>
          </div>
        </div>

        <PreviewMock />
      </div>
    </section>
  );
}

function PreviewMock() {
  return (
    <div aria-hidden className="select-none rounded-md border border-line bg-surface p-5">
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-ink-faint">
        Example analysis
      </p>
      <div className="flex items-baseline justify-between border-b border-line pb-4">
        <div>
          <p className="text-sm text-ink-soft">Overall match</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-accent">78</p>
        </div>
        <p className="max-w-[14ch] text-right text-sm text-ink-soft">
          Strong match with a few missing keywords
        </p>
      </div>
      <div className="space-y-3 py-4">
        {[
          { label: "Skills", value: 84 },
          { label: "Experience", value: 76 },
          { label: "Summary", value: 71 },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <span className="w-20 text-sm text-ink-soft">{row.label}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunken">
              <span
                className="block h-full rounded-full bg-accent"
                style={{ width: `${row.value}%` }}
              />
            </span>
            <span className="w-7 text-right text-sm text-ink-faint">{row.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-line pt-4">
        <span className="rounded-sm bg-good-soft px-2 py-0.5 text-xs text-good">SQL</span>
        <span className="rounded-sm bg-good-soft px-2 py-0.5 text-xs text-good">Kubernetes</span>
        <span className="rounded-sm bg-bad-soft px-2 py-0.5 text-xs text-bad">Terraform</span>
        <span className="rounded-sm bg-surface-sunken px-2 py-0.5 text-xs text-ink-soft">
          +6 more
        </span>
      </div>
    </div>
  );
}
