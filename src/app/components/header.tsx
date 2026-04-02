import Link from "next/link";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { navigationLinks, siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-[90%] py-4">
        <div className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--header-surface)] px-4 py-3 shadow-[var(--shadow-soft)] [backdrop-filter:blur(18px)] md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-[var(--accent)] [box-shadow:0_18px_42px_var(--accent-glow)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- The site logo is a simple local asset inside a decorative brand mark and does not need the heavier next/image wrapper here. */}
              <img src="/logos.png" alt="FS logo" />
            </span>
            <div>
              <p className="text-xl font-semibold tracking-tight text-[var(--foreground)]">
                Farhaan Shaikh
              </p>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
                {siteConfig.shortName}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle compact />
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href="#subscribe"
              className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
            >
              Subscribe
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
