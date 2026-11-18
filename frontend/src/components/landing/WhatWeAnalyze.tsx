const groups = [
  {
    title: "Compatibility",
    items: ["ATS compatibility", "Overall match score", "Formatting issues"],
  },
  {
    title: "Content",
    items: ["Summary", "Experience", "Skills", "Education"],
  },
  {
    title: "Keywords",
    items: ["Matched keywords", "Missing critical keywords", "Missing nice-to-have keywords", "Overused phrases"],
  },
  {
    title: "Next steps",
    items: ["Quick, actionable improvements"],
  },
];

export function WhatWeAnalyze() {
  return (
    <section id="what-we-analyze" className="border-t border-line py-20">
      <div className="mx-auto max-w-content px-6">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What Hirelens analyzes</h2>
        <p className="mt-3 max-w-prose text-ink-soft">
          Every analysis compares your resume against the specific job description you provide —
          not a generic template.
        </p>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-medium text-ink">{group.title}</h3>
              <ul className="mt-3 space-y-2 border-l border-line pl-4 text-sm text-ink-soft">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
