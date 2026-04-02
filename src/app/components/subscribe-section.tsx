import { SubscribeForm } from "@/app/components/subscribe-form";
import { siteConfig } from "@/lib/site-config";

type Props = {
  title?: string;
  description?: string;
  compact?: boolean;
};

export function SubscribeSection({
  title = siteConfig.newsletterTitle,
  description = siteConfig.newsletterDescription,
  compact = false,
}: Props) {
  return (
    <section
      id="subscribe"
      className={`rounded-[2rem] border border-[var(--border)] [background:var(--subscribe-gradient)] ${
        compact ? "p-6" : "p-8 md:p-10"
      } shadow-[var(--shadow-soft)]`}
    >
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Newsletter
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] md:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">{description}</p>
      </div>

      <div className="mt-6">
        <SubscribeForm compact />
      </div>
    </section>
  );
}
