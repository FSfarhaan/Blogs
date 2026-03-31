import Link from "next/link";
import { navigationLinks, siteConfig } from "@/lib/site-config";

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-[90%] px-6 py-4 md:px-10">
        <div className="flex items-center justify-between rounded-full border border-[var(--border)] bg-[color:rgba(255,250,244,0.88)] px-4 py-3 shadow-[var(--shadow-soft)] md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-[var(--accent)] text-lg font-semibold text-white shadow-lg shadow-[color:rgba(212,87,47,0.3)]">
            <img src="/logo.png" alt="FS logo" />
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
          <Link
            href="#subscribe"
            className="inline-flex items-center rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
          >
            Subscribe
          </Link>
        </nav>
        </div>
      </div>
    </header>
  );
}
