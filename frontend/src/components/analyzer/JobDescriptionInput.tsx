"use client";

import { cx } from "@/lib/utils";
import { JD_MAX_CHARS, JD_MIN_CHARS } from "@/lib/validation";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JobDescriptionInput({ value, onChange }: JobDescriptionInputProps) {
  const length = value.length;
  const tooShort = length > 0 && length < JD_MIN_CHARS;
  const tooLong = length > JD_MAX_CHARS;

  return (
    <div>
      <label htmlFor="job-description" className="text-sm font-medium text-ink">
        Job description
      </label>
      <textarea
        id="job-description"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the full job posting here — including responsibilities and required qualifications. More context gives a more accurate comparison."
        rows={16}
        aria-describedby="job-description-count"
        aria-invalid={tooShort || tooLong}
        className={cx(
          "mt-2 w-full resize-y rounded-md border bg-surface p-4 text-[0.95rem] leading-relaxed text-ink placeholder:text-ink-faint",
          tooShort || tooLong ? "border-bad" : "border-line-strong"
        )}
      />
      <div id="job-description-count" className="mt-1.5 flex justify-between text-xs">
        <span className={cx(tooShort || tooLong ? "text-bad" : "text-ink-faint")}>
          {tooShort && `Add at least ${JD_MIN_CHARS - length} more characters for a useful comparison.`}
          {tooLong && `Job description is too long by ${length - JD_MAX_CHARS} characters.`}
        </span>
        <span className="text-ink-faint">
          {length.toLocaleString()} / {JD_MAX_CHARS.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
