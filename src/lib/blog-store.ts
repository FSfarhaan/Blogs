import { Buffer } from "node:buffer";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { ObjectId } from "mongodb";
import type { BlogContentResponse } from "@/lib/blog-content";
import type { BlogPost, BlogPostSummary, BlogPostsPage } from "@/lib/blog";
import { getMongoDb } from "@/lib/mongodb";
import { siteConfig } from "@/lib/site-config";

const BLOG_COLLECTION_NAME = "blogPosts";
const STORE_REVALIDATE_SECONDS = 60 * 15;

type StoredBlogPostDocument = BlogPost & {
  _id: ObjectId;
  notionPageId: string;
  blocks: BlogContentResponse["blocks"];
  wordCount: number;
  generatedAt: string;
  syncedAt: string;
};

type StoredBlogPost = Omit<StoredBlogPostDocument, "_id">;

type DecodedCursor = {
  id: string;
  publishedAt: string;
};

let indexesEnsured = false;

async function getBlogPostsCollection() {
  const db = await getMongoDb();
  const collection = db.collection<StoredBlogPostDocument>(BLOG_COLLECTION_NAME);

  if (!indexesEnsured) {
    await Promise.all([
      collection.createIndex({ slug: 1 }, { unique: true }),
      collection.createIndex({ notionPageId: 1 }, { unique: true }),
      collection.createIndex({ publishedAt: -1, _id: -1 }),
      collection.createIndex({ featured: -1, publishedAt: -1, _id: -1 }),
      collection.createIndex({ tags: 1 }),
    ]);
    indexesEnsured = true;
  }

  return collection;
}

function toSummary(post: StoredBlogPostDocument): BlogPostSummary {
  return {
    id: post.notionPageId,
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverImage: post.coverImage,
    thumbnailImage: post.thumbnailImage,
    icon: post.icon,
    author: post.author,
    tags: post.tags,
    featured: post.featured,
  };
}

function toPost(post: StoredBlogPostDocument): BlogPost & {
  blocks: BlogContentResponse["blocks"];
  wordCount: number;
  generatedAt: string;
  notionPageId: string;
  syncedAt: string;
} {
  return {
    id: post.notionPageId,
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverImage: post.coverImage,
    thumbnailImage: post.thumbnailImage,
    icon: post.icon,
    author: post.author,
    tags: post.tags,
    featured: post.featured,
    readingTime: post.readingTime,
    canonicalUrl: post.canonicalUrl,
    blocks: post.blocks,
    wordCount: post.wordCount,
    generatedAt: post.generatedAt,
    notionPageId: post.notionPageId,
    syncedAt: post.syncedAt,
  };
}

function encodeCursor(post: StoredBlogPostDocument) {
  return Buffer.from(
    JSON.stringify({
      id: post._id.toHexString(),
      publishedAt: post.publishedAt,
    } satisfies DecodedCursor),
  ).toString("base64url");
}

function decodeCursor(cursor?: string | null): DecodedCursor | null {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as DecodedCursor;

    if (!parsed.id || !parsed.publishedAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function normalizeStoredSlug(slug: string) {
  try {
    return decodeURIComponent(slug).trim().replace(/^\/+|\/+$/g, "");
  } catch {
    return slug.trim().replace(/^\/+|\/+$/g, "");
  }
}

async function queryStoredPosts(options?: {
  cursor?: string;
  limit?: number;
  featuredOnly?: boolean;
}) {
  const collection = await getBlogPostsCollection();
  const limit = options?.limit ?? 20;
  const decodedCursor = decodeCursor(options?.cursor);
  const filter: Record<string, unknown> = {};

  if (options?.featuredOnly) {
    filter.featured = true;
  }

  if (decodedCursor) {
    filter.$or = [
      { publishedAt: { $lt: decodedCursor.publishedAt } },
      {
        publishedAt: decodedCursor.publishedAt,
        _id: { $lt: new ObjectId(decodedCursor.id) },
      },
    ];
  }

  const posts = await collection
    .find(filter)
    .sort({ publishedAt: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasMore = posts.length > limit;
  const pagePosts = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? encodeCursor(pagePosts[pagePosts.length - 1]!) : null;

  return {
    posts: pagePosts,
    nextCursor,
    hasMore,
  };
}

const getCachedPublishedPostsPage = unstable_cache(
  async (cursor?: string, limit = 20) => {
    const { posts, nextCursor, hasMore } = await queryStoredPosts({
      cursor,
      limit,
    });

    return {
      posts: posts.map((post) => toSummary(post)),
      nextCursor,
      hasMore,
    } satisfies BlogPostsPage;
  },
  ["stored-published-posts-page"],
  { revalidate: STORE_REVALIDATE_SECONDS },
);

export async function getPublishedPostsPage(options?: {
  cursor?: string;
  limit?: number;
}) {
  return getCachedPublishedPostsPage(options?.cursor, options?.limit ?? 20);
}

export const getPublishedPosts = cache(async () => {
  const collection = await getBlogPostsCollection();
  const posts = await collection.find({}).sort({ publishedAt: -1, _id: -1 }).toArray();
  return posts.map((post) => toSummary(post));
});

export const getPosts = getPublishedPosts;

export const getHomepagePosts = cache(async () => {
  const [featuredResult, latestResult] = await Promise.all([
    queryStoredPosts({ featuredOnly: true, limit: 5 }),
    queryStoredPosts({ limit: 18 }),
  ]);

  const mergedPosts = [...featuredResult.posts, ...latestResult.posts];
  const uniquePosts = mergedPosts.filter(
    (post, index, allPosts) =>
      allPosts.findIndex((candidate) => candidate.notionPageId === post.notionPageId) ===
      index,
  );

  return uniquePosts.slice(0, 18).map((post) => toSummary(post));
});

const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    const collection = await getBlogPostsCollection();
    const post = await collection.findOne({ slug });
    return post ? toPost(post) : null;
  },
  ["stored-post-by-slug"],
  { revalidate: STORE_REVALIDATE_SECONDS },
);

export const getPostBySlug = cache(async (slug: string) => {
  const normalizedSlug = normalizeStoredSlug(slug);
  const normalizedLowerSlug = normalizedSlug.toLowerCase();

  const post = await getCachedPostBySlug(normalizedSlug);

  if (post || normalizedLowerSlug === normalizedSlug) {
    return post;
  }

  return getCachedPostBySlug(normalizedLowerSlug);
});

export const getPostByPageId = cache(async (pageId: string) => {
  const collection = await getBlogPostsCollection();
  const post = await collection.findOne({ notionPageId: pageId });
  return post ? toPost(post) : null;
});

export async function getRecentPosts(limit = 4, excludeSlug?: string) {
  const collection = await getBlogPostsCollection();
  const posts = await collection
    .find(excludeSlug ? { slug: { $ne: excludeSlug } } : {})
    .sort({ publishedAt: -1, _id: -1 })
    .limit(limit)
    .toArray();

  return posts.map((post) => toSummary(post));
}

export async function getRelatedPosts(options: {
  slug: string;
  tags: string[];
  limit?: number;
}) {
  const { slug, tags, limit = 3 } = options;
  const normalizedTags = tags
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  const collection = await getBlogPostsCollection();
  const posts = await collection.find({ slug: { $ne: slug } }).toArray();

  const scoredPosts = posts
    .map((post) => {
      const score = post.tags.reduce((total, tag) => {
        return total + (normalizedTags.includes(tag.trim().toLowerCase()) ? 1 : 0);
      }, 0);

      return { post, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime()
      );
    });

  const matchedPosts = scoredPosts
    .filter((entry) => entry.score > 0)
    .map((entry) => toSummary(entry.post))
    .slice(0, limit);

  if (matchedPosts.length >= limit) {
    return matchedPosts;
  }

  const fallbackPosts = scoredPosts
    .filter((entry) => entry.score === 0)
    .map((entry) => toSummary(entry.post))
    .slice(0, limit - matchedPosts.length);

  return [...matchedPosts, ...fallbackPosts];
}

export async function upsertStoredPost(post: StoredBlogPost) {
  const collection = await getBlogPostsCollection();

  await collection.updateOne(
    { notionPageId: post.notionPageId },
    {
      $set: post,
    },
    { upsert: true },
  );
}

export async function removeStoredPostsNotInPageIds(pageIds: string[]) {
  const collection = await getBlogPostsCollection();

  if (pageIds.length === 0) {
    const result = await collection.deleteMany({});
    return result.deletedCount ?? 0;
  }

  const result = await collection.deleteMany({
    notionPageId: { $nin: pageIds },
  });

  return result.deletedCount ?? 0;
}

export async function getStoredPostSyncMeta() {
  const collection = await getBlogPostsCollection();
  const posts = await collection
    .find(
      {},
      {
        projection: {
          notionPageId: 1,
          updatedAt: 1,
          syncedAt: 1,
          slug: 1,
        },
      },
    )
    .toArray();

  return posts.map((post) => ({
    notionPageId: post.notionPageId,
    updatedAt: post.updatedAt,
    syncedAt: post.syncedAt,
    slug: post.slug,
  }));
}

export function buildStoredCanonicalUrl(slug: string) {
  return `${siteConfig.url}/blog/${slug}`;
}
