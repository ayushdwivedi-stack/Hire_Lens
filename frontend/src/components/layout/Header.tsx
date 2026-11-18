import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight text-ink">
          Hirelens
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-ink-soft md:flex" aria-label="Primary">
          <Link href="/#how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/#what-we-analyze" className="hover:text-ink">
            What we analyze
          </Link>
          <Link href="/#privacy" className="hover:text-ink">
            Privacy
          </Link>
        </nav>
        <ButtonLink href="/analyze" variant="primary" className="text-sm">
          Analyze resume
        </ButtonLink>
      </div>
    </header>
  );
}
