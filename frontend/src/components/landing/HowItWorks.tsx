const steps = [
  {
    title: "Upload your resume",
    body: "Drop in a PDF. Hirelens reads the text directly — nothing is retyped or reformatted.",
  },
  {
    title: "Paste the job description",
    body: "Add the posting you're applying to. The more complete it is, the more precise the comparison.",
  },
  {
    title: "Review the match",
    body: "Get a section-by-section breakdown: what matches, what's missing, and what to fix first.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="border-t-2 border-ink pt-4">
              <p className="text-sm text-ink-faint">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-serif text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
