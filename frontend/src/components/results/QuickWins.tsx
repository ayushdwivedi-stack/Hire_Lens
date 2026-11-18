export function QuickWins({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-faint">No quick wins to show for this analysis.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-4">
          <span className="mt-0.5 font-serif text-sm font-semibold text-accent">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="text-[0.95rem] leading-relaxed text-ink">{item}</p>
        </li>
      ))}
    </ol>
  );
}
