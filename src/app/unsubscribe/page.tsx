import Link from "next/link";
import type { Metadata } from "next";
import { deleteSubscriberByEmail } from "@/lib/firebase";
import {
  normalizeSubscriberEmail,
  verifySubscriberUnsubscribeToken,
} from "@/lib/subscriber-unsubscribe";

type PageProps = {
  searchParams: Promise<{
    email?: string;
    token?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Manage your blog email subscription.",
};

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const { email = "", token = "" } = await searchParams;
  const normalizedEmail = normalizeSubscriberEmail(email);

  let isSuccess = false;
  let title = "Unsubscribe link is invalid";
  let message =
    "This unsubscribe link is missing information or is no longer valid.";

  if (normalizedEmail && token) {
    if (verifySubscriberUnsubscribeToken(normalizedEmail, token)) {
      await deleteSubscriberByEmail(normalizedEmail);
      isSuccess = true;
      title = "You have been unsubscribed";
      message =
        "You will no longer receive blog update emails. You can subscribe again any time if you want to come back.";
    } else {
      message =
        "This unsubscribe request could not be verified. Please use the latest email link.";
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          FS Blogs
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-base leading-8 text-[var(--muted)]">
          {message}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
          >
            Back to home
          </Link>
          {!isSuccess ? (
            <Link
              href="/blogs"
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-pill)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Browse blogs
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
