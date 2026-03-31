"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { EmptyState } from "@/app/components/empty-state";
import { PostCard } from "@/app/components/post-card";
import type { BlogPostSummary } from "@/lib/blog";

type BlogsFeedProps = {
  initialPosts: BlogPostSummary[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
  pageSize?: number;
};

type BlogsPageResponse = {
  posts: BlogPostSummary[];
  nextCursor: string | null;
  hasMore: boolean;
};

export function BlogsFeed({
  initialPosts,
  initialNextCursor,
  initialHasMore,
  pageSize = 6,
}: BlogsFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setNextCursor(initialNextCursor);
    setHasMore(initialHasMore);
    setIsLoading(false);
  }, [initialHasMore, initialNextCursor, initialPosts]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting || isLoading || !hasMore) {
          return;
        }

        const loadMorePosts = async () => {
          setIsLoading(true);

          try {
            const params = new URLSearchParams({
              limit: String(pageSize),
            });

            if (nextCursor) {
              params.set("cursor", nextCursor);
            }

            const response = await fetch(`/api/blogs?${params.toString()}`, {
              cache: "no-store",
            });

            if (!response.ok) {
              throw new Error("Failed to fetch more posts");
            }

            const data = (await response.json()) as BlogsPageResponse;

            startTransition(() => {
              setPosts((currentPosts) => {
                const knownIds = new Set(currentPosts.map((post) => post.id));
                const newPosts = data.posts.filter((post) => !knownIds.has(post.id));
                return [...currentPosts, ...newPosts];
              });
              setNextCursor(data.nextCursor);
              setHasMore(data.hasMore);
            });
          } catch (error) {
            console.error("Unable to load more blog posts", error);
          } finally {
            setIsLoading(false);
          }
        };

        void loadMorePosts();
      },
      {
        rootMargin: "720px 0px 240px",
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, nextCursor, pageSize]);

  if (!posts.length) {
    return (
      <EmptyState
        title="No published blogs yet"
        description="Once your Notion posts are marked as published, they will appear here automatically."
      />
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden="true" className="h-4 w-full" />

      {isLoading ? (
        <div className="flex justify-center">
          <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2 text-sm font-medium text-[var(--muted)] shadow-[var(--shadow-soft)]">
            Loading more posts...
          </div>
        </div>
      ) : null}

      {!hasMore ? (
        <div className="flex justify-center">
          <p className="text-sm leading-7 text-[var(--muted)]">
            You have reached the end of the archive.
          </p>
        </div>
      ) : null}
    </section>
  );
}
