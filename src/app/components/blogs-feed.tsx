"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { EmptyState } from "@/app/components/empty-state";
import { PostCard } from "@/app/components/post-card";
import type { BlogPostSummary } from "@/lib/blog";

type BlogsFeedProps = {
  initialPosts: BlogPostSummary[];
};

export function BlogsFeed({ initialPosts }: BlogsFeedProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const deferredQuery = useDeferredValue(query);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    initialPosts.forEach((post) => {
      post.tags.forEach((tag) => {
        const normalizedTag = tag.trim();

        if (!normalizedTag) {
          return;
        }

        counts.set(normalizedTag, (counts.get(normalizedTag) ?? 0) + 1);
      });
    });

    return [...counts.entries()].sort((left, right) => left[0].localeCompare(right[0]));
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All categories" ||
        post.tags.some((tag) => tag.trim() === selectedCategory);

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        post.title,
        post.description,
        post.author,
        ...post.tags,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [deferredQuery, initialPosts, selectedCategory]);

  if (!initialPosts.length) {
    return (
      <EmptyState
        title="No published blogs yet"
        description="Once your Notion posts are marked as published, they will appear here automatically."
      />
    );
  }

  return (
    <section className="space-y-6">
      
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_15rem_auto] lg:items-center">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts by title, topic, or keyword"
              className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
            />
            
          </div>

          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-12 w-full appearance-none rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-5 text-sm font-medium text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
            >
              <option value="All categories">
                All categories ({initialPosts.length})
              </option>
              {categoryCounts.map(([category, count]) => (
                <option key={category} value={category}>
                  {category} ({count})
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]">
              v
            </span>
          </div>
              
          
        </div>

        <p className="mt-2 px-1 text-left text-xs font-medium text-[var(--muted)]">
            Showing <span className="text-[var(--foreground)]">{filteredPosts.length}</span> posts
          </p>
      

      {filteredPosts.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No posts match that search"
          description="Try a different keyword or switch back to all categories."
        />
      )}
    </section>
  );
}
