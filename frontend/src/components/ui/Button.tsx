import { cx } from "@/lib/utils";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-[0.95rem]";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary: "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-surface-sunken",
  ghost: "bg-transparent text-ink-soft hover:text-ink underline decoration-line-strong underline-offset-4",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={cx(base, variants[variant], className)} {...props} />;
}

interface ButtonLinkProps {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}

export function ButtonLink({ href, variant = "primary", className, children, ariaLabel }: ButtonLinkProps) {
  return (
    <Link href={href} aria-label={ariaLabel} className={cx(base, variants[variant], className)}>
      {children}
    </Link>
  );
}
