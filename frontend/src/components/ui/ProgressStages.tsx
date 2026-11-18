import { cx } from "@/lib/utils";

export interface Stage {
  label: string;
}

export function ProgressStages({
  stages,
  activeIndex,
}: {
  stages: Stage[];
  activeIndex: number;
}) {
  return (
    <ol className="space-y-3" aria-label="Analysis progress">
      {stages.map((stage, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <li key={stage.label} className="flex items-center gap-3">
            <span
              aria-hidden
              className={cx(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                isDone && "bg-accent",
                isActive && "bg-accent animate-pulse-bar",
                !isDone && !isActive && "bg-line-strong"
              )}
            />
            <span
              className={cx(
                "text-sm",
                isDone && "text-ink-soft",
                isActive && "text-ink font-medium",
                !isDone && !isActive && "text-ink-faint"
              )}
              aria-current={isActive ? "step" : undefined}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
