import { SubscribeForm } from "@/app/components/subscribe-form";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--footer-surface)]">
      <div className="mx-auto grid w-full max-w-[90%] gap-6 px-6 py-8 md:px-10 lg:grid-cols-[minmax(0,1fr)_31rem] lg:items-center">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {siteConfig.shortName}
          </p>
          <h2 className="max-w-xl text-xl font-semibold tracking-tight text-[var(--foreground)] md:text-2xl">
            Notes on building, shipping, and learning in public.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            Essays, experiments, and honest lessons from the work behind this blog.
          </p>
        </div>

        <section
          id="subscribe"
        >
          {/* <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Newsletter
          </p> */}
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-[var(--foreground)]">
            New posts, no noise.
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
            One short email when something new is published.
          </p>

          <div className="mt-3">
            <SubscribeForm
              compact
              placeholder="Enter your email"
              buttonLabel="Subscribe"
              idleMessage="No spam. Only new posts."
              className="space-y-3"
              inputClassName="h-10 text-xs"
              buttonClassName="h-10 px-4 text-xs"
            />
          </div>
        </section>
      </div>
    </footer>
  );
}
