import { getFreshPublishedPosts as getPublishedNotionPosts } from "@/lib/blog";
import { getBlogContentByPageId } from "@/lib/notion-content-service";
import {
  buildStoredCanonicalUrl,
  getStoredPostSyncMeta,
  removeStoredPostsNotInPageIds,
  upsertStoredPost,
} from "@/lib/blog-store";

export type BlogSyncStatus = {
  upToDate: boolean;
  notionCount: number;
  syncedCount: number;
  staleCount: number;
  lastSyncedAt: string | null;
};

export type BlogSyncResult = BlogSyncStatus & {
  syncedNow: number;
  skipped: number;
  removed: number;
  syncedSlugs: string[];
};

export async function getBlogSyncStatus(): Promise<BlogSyncStatus> {
  const [notionPosts, storedMeta] = await Promise.all([
    getPublishedNotionPosts(),
    getStoredPostSyncMeta(),
  ]);

  const metaByPageId = new Map(
    storedMeta.map((post) => [post.notionPageId, post]),
  );

  const staleCount = notionPosts.filter((post) => {
    const storedPost = metaByPageId.get(post.id);
    return !storedPost || storedPost.updatedAt !== post.updatedAt;
  }).length;

  const lastSyncedAt = storedMeta
    .map((post) => post.syncedAt)
    .filter((value): value is string => typeof value === "string")
    .sort()
    .at(-1) ?? null;

  return {
    upToDate: notionPosts.length > 0 ? staleCount === 0 : true,
    notionCount: notionPosts.length,
    syncedCount: storedMeta.length,
    staleCount,
    lastSyncedAt,
  };
}

export async function syncPublishedPostsFromNotion(): Promise<BlogSyncResult> {
  const notionPosts = await getPublishedNotionPosts();
  const storedMeta = await getStoredPostSyncMeta();
  const metaByPageId = new Map(
    storedMeta.map((post) => [post.notionPageId, post]),
  );

  let syncedNow = 0;
  let skipped = 0;
  const syncedSlugs: string[] = [];

  for (const notionPost of notionPosts) {
    const existingPost = metaByPageId.get(notionPost.id);

    if (existingPost?.updatedAt === notionPost.updatedAt) {
      skipped += 1;
      continue;
    }

    const content = await getBlogContentByPageId(notionPost.id, notionPost.updatedAt);

    await upsertStoredPost({
      notionPageId: notionPost.id,
      id: notionPost.id,
      slug: notionPost.slug,
      title: notionPost.title,
      description: notionPost.description,
      publishedAt: notionPost.publishedAt,
      updatedAt: notionPost.updatedAt,
      coverImage: notionPost.coverImage,
      thumbnailImage: notionPost.thumbnailImage,
      icon: notionPost.icon,
      author: notionPost.author,
      tags: notionPost.tags,
      featured: notionPost.featured,
      readingTime: content.readingTime,
      canonicalUrl: buildStoredCanonicalUrl(notionPost.slug),
      blocks: content.blocks,
      wordCount: content.wordCount,
      generatedAt: content.generatedAt,
      syncedAt: new Date().toISOString(),
    });

    syncedNow += 1;
    syncedSlugs.push(notionPost.slug);
  }

  const removed = await removeStoredPostsNotInPageIds(notionPosts.map((post) => post.id));
  const status = await getBlogSyncStatus();

  return {
    ...status,
    syncedNow,
    skipped,
    removed,
    syncedSlugs,
  };
}
