"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  AdminDashboardPost,
  AdminDashboardSyncStatus,
} from "@/lib/admin-types";
import { formatDate } from "@/lib/utils";

type Props = {
  initialPosts: AdminDashboardPost[];
  initialSyncStatus: AdminDashboardSyncStatus;
};

export function AdminDashboard({ initialPosts, initialSyncStatus }: Props) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [syncStatus, setSyncStatus] = useState(initialSyncStatus);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  useEffect(() => {
    setSyncStatus(initialSyncStatus);
  }, [initialSyncStatus]);

  async function sendPostEmail(slug: string) {
    setBusySlug(slug);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/notification`, {
        method: "POST",
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send the email.");
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.slug === slug ? { ...post, emailSent: true } : post,
        ),
      );
      setFeedback(data.message ?? "Email sent.");
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : "Unable to send the email.",
      );
    } finally {
      setBusySlug(null);
    }
  }

  async function setEmailStatus(slug: string, emailSent: boolean) {
    setBusySlug(slug);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${encodeURIComponent(slug)}/notification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailSent }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
        emailSent?: boolean;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to update the email status.");
      }

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.slug === slug
            ? { ...post, emailSent: data.emailSent === true }
            : post,
        ),
      );
      setFeedback(data.message ?? "Email status updated.");
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update the email status.",
      );
    } finally {
      setBusySlug(null);
    }
  }

  async function logout() {
    setIsLoggingOut(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to log out right now.");
      }

      startTransition(() => {
        router.replace("/admin");
        router.refresh();
      });
    } catch (logoutError) {
      setError(
        logoutError instanceof Error ? logoutError.message : "Unable to log out.",
      );
      setIsLoggingOut(false);
    }
  }

  async function syncPosts() {
    setIsSyncing(true);
    setFeedback(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/sync-posts", {
        method: "POST",
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
        syncStatus?: AdminDashboardSyncStatus;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to sync posts right now.");
      }

      if (data.syncStatus) {
        setSyncStatus(data.syncStatus);
      }

      setFeedback(data.message ?? "Posts synced.");

      startTransition(() => {
        router.refresh();
      });
    } catch (syncError) {
      setError(
        syncError instanceof Error ? syncError.message : "Unable to sync posts.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,rgba(255,250,244,0.98),rgba(250,240,231,0.94))] p-8 shadow-[var(--shadow-soft)] md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Admin dashboard
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
            Published posts
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
            Review posts, send subscriber emails, and toggle whether a post has already
            been announced.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2">
              Notion posts: <span className="font-semibold text-[var(--foreground)]">{syncStatus.notionCount}</span>
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2">
              Synced in Mongo: <span className="font-semibold text-[var(--foreground)]">{syncStatus.syncedCount}</span>
            </span>
            <span className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2">
              Out of date: <span className="font-semibold text-[var(--foreground)]">{syncStatus.staleCount}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={syncPosts}
            disabled={isSyncing || syncStatus.upToDate}
            className="inline-flex items-center rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncing
              ? "Syncing posts..."
              : syncStatus.upToDate
                ? "All posts synced"
                : "Sync posts"}
          </button>
          <button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>

      {feedback ? (
        <p className="rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-[color:rgba(208,77,46,0.18)] bg-[color:rgba(208,77,46,0.08)] px-4 py-3 text-sm font-medium text-[color:#a33d24]">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[color:rgba(255,250,244,0.86)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Upload time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Email sent
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {posts.map((post) => {
                const isBusy = busySlug === post.slug;

                return (
                  <tr key={post.slug} className="align-top">
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-base font-semibold text-[var(--foreground)]">
                          {post.title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                          {post.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-[var(--foreground)]">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                          post.emailSent
                            ? "bg-[color:rgba(53,137,88,0.14)] text-[color:#246b45]"
                            : "bg-[color:rgba(107,91,210,0.12)] text-[color:#5848bb]"
                        }`}
                      >
                        {String(post.emailSent)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          Open post
                        </a>
                        {!post.emailSent ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => sendPostEmail(post.slug)}
                            className="inline-flex items-center rounded-full bg-[var(--foreground)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? "Sending..." : "Send email"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setEmailStatus(post.slug, false)}
                            className="inline-flex items-center rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isBusy ? "Updating..." : "Mark unsent"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
