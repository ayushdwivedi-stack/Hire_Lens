export function AtsFlagsList({ flags }: { flags: string[] }) {
  if (flags.length === 0) {
    return <p className="text-sm text-ink-faint">No ATS formatting issues detected.</p>;
  }

  return (
    <ul className="space-y-3">
      {flags.map((flag, i) => (
        <li key={i} className="flex gap-3 rounded-md border border-warn/30 bg-warn-soft px-4 py-3">
          <span aria-hidden className="mt-0.5 text-warn">
            !
          </span>
          <span className="text-sm leading-relaxed text-ink">{flag}</span>
        </li>
      ))}
    </ul>
  );
}
