import type { Metadata } from "next";
import { BlogsFeed } from "@/app/components/blogs-feed";
import { getPublishedPostsPage } from "@/lib/blog-store";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Browse the full archive of published posts.",
};

export const revalidate = 900;

export default async function BlogsPage() {
  const initialPage = await getPublishedPostsPage({
    limit: 6,
  });

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
      <section className="rounded-[2.25rem] border border-[var(--border)] bg-[linear-gradient(160deg,rgba(255,250,244,0.98),rgba(252,238,228,0.94))] p-8 shadow-[var(--shadow-soft)] md:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Blog archive
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
          Every published article in one place
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--muted)]">
          A simple archive page for browsing everything you have published from
          Notion. Every card links straight to the live post using its slug.
        </p>
      </section>

      <BlogsFeed
        initialPosts={initialPage.posts}
        initialNextCursor={initialPage.nextCursor}
        initialHasMore={initialPage.hasMore}
        pageSize={6}
      />
    </main>
  );
}
