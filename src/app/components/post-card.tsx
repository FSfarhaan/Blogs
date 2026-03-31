import Link from "next/link";
import type { BlogPostSummary } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

type Props = {
  post: BlogPostSummary;
  priority?: "featured" | "default" | "compact";
};

function PlaceholderBadge({ label }: { label: string }) {
  return (
    <span className="relative rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {label}
    </span>
  );
}

export function PostCard({ post, priority = "default" }: Props) {
  const isCompact = priority === "compact";
  const isFeatured = priority === "featured";
  const displayImage = post.thumbnailImage ?? post.coverImage;

  return (
    <article
      className={`group overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(165deg,rgba(255,251,246,0.97),rgba(249,239,228,0.94))]  transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-strong)] ${
        isCompact ? "p-4" : "p-3"
      }`}
    >
      {isCompact ? (
        <Link
          href={`/blog/${post.slug}`}
          className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-4"
        >
          <div className="overflow-hidden rounded-[1.35rem] border border-white/70 bg-[var(--surface-strong)]">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- Blog thumbnails are CMS-managed remote images and we intentionally keep the card rendering simple.
              <img
                src={displayImage}
                alt={post.title}
                className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="relative flex aspect-square items-end overflow-hidden bg-[linear-gradient(135deg,#fff4ea,#fde1d4_45%,#efe7ff)] p-4">
                <div className="absolute right-3 top-3 h-12 w-12 rounded-[1.25rem] bg-[color:rgba(107,91,210,0.14)]" />
                <PlaceholderBadge label={post.tags[0] ?? "Blog"} />
              </div>
            )}
          </div>

          <div className="min-w-0 py-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>{post.tags[0] ?? "Post"}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <h2 className="mt-2 line-clamp-2 text-base font-semibold leading-6 tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
              {post.description}
            </p>
          </div>
        </Link>
      ) : (
        <>
          <Link href={`/blog/${post.slug}`} className="block">
            <div className="relative overflow-hidden rounded-[1.55rem] border border-white/75 bg-[var(--surface-strong)]">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element -- Blog thumbnails are CMS-managed remote images and we intentionally keep the card rendering simple.
                <img
                  src={displayImage}
                  alt={post.title}
                  className="aspect-[16/10] h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="relative flex aspect-[16/10] items-end overflow-hidden bg-[linear-gradient(135deg,#fff4ea,#fde1d4_45%,#efe7ff)] p-6">
                  <div className="absolute right-6 top-6 h-20 w-20 rounded-[2rem] bg-[color:rgba(107,91,210,0.12)]" />
                  <div className="absolute bottom-4 right-10 h-24 w-24 rounded-full bg-[color:rgba(239,109,67,0.15)] blur-xl" />
                  <PlaceholderBadge label={post.tags[0] ?? "Latest"} />
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[color:rgba(239,109,67,0.94)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {post.tags[0] ?? "Post"}
                </span>
                <span className="rounded-full border border-white/70 bg-white/88 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  {formatDate(post.publishedAt)}
                </span>
              </div>
            </div>
          </Link>

          <div className="space-y-4 px-2 pb-2 pt-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{post.tags[1] ?? post.tags[0] ?? "Published"}</span>
            </div>

            <div>
              <h2
                className={`line-clamp-2 font-semibold tracking-tight text-[var(--foreground)] ${
                  isFeatured ? "text-[2rem] leading-tight" : "text-xl leading-8"
                }`}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition hover:text-[var(--accent)]"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                {post.description}
              </p>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
            >
              Open article
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      )}
    </article>
  );
}
