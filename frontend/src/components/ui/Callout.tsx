import { cx } from "@/lib/utils";

type Tone = "error" | "notice";

interface CalloutProps {
  tone?: Tone;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}

export function Callout({ tone = "notice", title, children, action }: CalloutProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded border px-4 py-3.5",
        tone === "error" ? "border-bad/30 bg-bad-soft" : "border-line bg-surface-sunken"
      )}
    >
      <p className={cx("text-sm font-medium", tone === "error" ? "text-bad" : "text-ink")}>
        {title}
      </p>
      {children && <p className="mt-1 text-sm text-ink-soft">{children}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
