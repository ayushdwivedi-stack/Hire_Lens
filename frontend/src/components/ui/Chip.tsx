import { cx } from "@/lib/utils";

type Tone = "neutral" | "good" | "bad" | "warn";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-soft",
  good: "bg-good-soft text-good",
  bad: "bg-bad-soft text-bad",
  warn: "bg-warn-soft text-warn",
};

export function Chip({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[0.8rem] leading-none",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
