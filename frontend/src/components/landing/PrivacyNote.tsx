export function PrivacyNote() {
  return (
    <section id="privacy" className="border-t border-line py-20">
      <div className="mx-auto max-w-content px-6">
        <div className="max-w-prose">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Where your resume goes
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Hirelens sends your resume text and the job description to your own backend, which
            runs the comparison and returns the result. In the local setup, that backend calls a
            model through Ollama running on your machine, rather than an external AI provider.
            The backend can also be configured to use a hosted provider instead — check your
            deployment&apos;s configuration if you need to know which one is active.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            Resume files aren&apos;t stored after an analysis finishes. Results are kept only in
            your browser for the current session, so they&apos;re there when you navigate to your
            results — and gone once you close the tab.
          </p>
        </div>
      </div>
    </section>
  );
}
