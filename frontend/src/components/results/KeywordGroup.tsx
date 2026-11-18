"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/Chip";

type Tone = "neutral" | "good" | "bad" | "warn";

const VISIBLE_LIMIT = 10;

export function KeywordGroup({
  label,
  description,
  tone,
  items,
}: {
  label: string;
  description: string;
  tone: Tone;
  items: string[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-medium text-ink">{label}</h3>
        <p className="mt-1 text-xs text-ink-faint">{description}</p>
        <p className="mt-3 text-sm text-ink-faint">None found.</p>
      </div>
    );
  }

  const visible = expanded ? items : items.slice(0, VISIBLE_LIMIT);
  const remaining = items.length - visible.length;

  return (
    <div>
      <h3 className="text-sm font-medium text-ink">{label}</h3>
      <p className="mt-1 text-xs text-ink-faint">{description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <Chip key={item} tone={tone}>
            {item}
          </Chip>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex items-center rounded-sm bg-surface-sunken px-2.5 py-1 text-[0.8rem] text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink"
          >
            +{remaining} more
          </button>
        )}
      </div>
    </div>
  );
}
