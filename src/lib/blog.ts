import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getBlogContentByPageId } from "@/lib/notion-content-service";
import { notion, NOTION_DATA_SOURCE_ID, withNotionRetry } from "@/lib/notion";
import {
  getHostedImageUrl,
  getNotionFileUrl,
  type NotionFileObject,
} from "@/lib/notion-assets";
import { siteConfig } from "@/lib/site-config";

type PlainTextFragment = {
  plain_text: string;
};

type TitleProperty = {
  type: "title";
  title: PlainTextFragment[];
};

type RichTextProperty = {
  type: "rich_text";
  rich_text: PlainTextFragment[];
};

type UrlProperty = {
  type: "url";
  url: string | null;
};

type EmailProperty = {
  type: "email";
  email: string | null;
};

type CheckboxProperty = {
  type: "checkbox";
  checkbox: boolean;
};

type DateProperty = {
  type: "date";
  date: {
    start: string;
  } | null;
};

type MultiSelectProperty = {
  type: "multi_select";
  multi_select: Array<{ name: string }>;
};

type FilesProperty = {
  type: "files";
  files: NotionFileObject[];
};

type SelectProperty = {
  type: "select";
  select: { name: string } | null;
};

type PeopleProperty = {
  type: "people";
  people: Array<{ name?: string | null }>;
};

type UnknownProperty = {
  type: string;
  [key: string]: unknown;
};

type NotionProperty =
  | TitleProperty
  | RichTextProperty
  | UrlProperty
  | EmailProperty
  | CheckboxProperty
  | DateProperty
  | MultiSelectProperty
  | FilesProperty
  | SelectProperty
  | PeopleProperty
  | UnknownProperty;

type NotionIconObject =
  | { type: "emoji"; emoji: string }
  | { type: "custom_emoji"; custom_emoji: { url: string } }
  | { type: "icon"; icon: { name: string; color?: string } }
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } }
  | null
  | undefined;

type DataSourceQueryParameters = Parameters<typeof notion.dataSources.query>[0];
type DataSourceFilter = NonNullable<DataSourceQueryParameters["filter"]>;
type QueryPublishedPostsOptions = {
  cursor?: string;
  filter?: DataSourceFilter;
  limit?: number;
};

const BLOG_SUMMARY_REVALIDATE_SECONDS = 60 * 15;

type NotionPage = {
  id: string;
  url?: string;
  created_time: string;
  last_edited_time: string;
  cover?: NotionFileObject;
  icon?: NotionIconObject;
  properties: Record<string, NotionProperty>;
};

export type BlogPostSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  coverImage: string | null;
  thumbnailImage: string | null;
  icon: string | null;
  author: string;
  tags: string[];
  featured: boolean;
};

export type BlogPost = BlogPostSummary & {
  readingTime: string;
  canonicalUrl: string;
};

export type BlogPostsPage = {
  posts: BlogPostSummary[];
  nextCursor: string | null;
  hasMore: boolean;
};

function isTitleProperty(
  property: NotionProperty | undefined,
): property is TitleProperty {
  return property?.type === "title" && Array.isArray(property.title);
}

function isRichTextProperty(
  property: NotionProperty | undefined,
): property is RichTextProperty {
  return property?.type === "rich_text" && Array.isArray(property.rich_text);
}

function isUrlProperty(property: NotionProperty | undefined): property is UrlProperty {
  return property?.type === "url";
}

function isEmailProperty(
  property: NotionProperty | undefined,
): property is EmailProperty {
  return property?.type === "email";
}

function isCheckboxProperty(
  property: NotionProperty | undefined,
): property is CheckboxProperty {
  return property?.type === "checkbox";
}

function isDateProperty(
  property: NotionProperty | undefined,
): property is DateProperty {
  return property?.type === "date";
}

function isMultiSelectProperty(
  property: NotionProperty | undefined,
): property is MultiSelectProperty {
  return property?.type === "multi_select" && Array.isArray(property.multi_select);
}

function isFilesProperty(
  property: NotionProperty | undefined,
): property is FilesProperty {
  return property?.type === "files" && Array.isArray(property.files);
}

function isSelectProperty(
  property: NotionProperty | undefined,
): property is SelectProperty {
  return property?.type === "select";
}

function isPeopleProperty(
  property: NotionProperty | undefined,
): property is PeopleProperty {
  return property?.type === "people" && Array.isArray(property.people);
}

function getPlainTextProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): string {
  for (const name of names) {
    const property = properties[name];

    if (!property) {
      continue;
    }

    if (isTitleProperty(property)) {
      return property.title.map((item) => item.plain_text).join("");
    }

    if (isRichTextProperty(property)) {
      return property.rich_text.map((item) => item.plain_text).join("");
    }

    if (isUrlProperty(property)) {
      return property.url ?? "";
    }

    if (isEmailProperty(property)) {
      return property.email ?? "";
    }
  }

  for (const property of Object.values(properties)) {
    if (isTitleProperty(property)) {
      return property.title.map((item) => item.plain_text).join("");
    }
  }

  return "";
}

function getCheckboxProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): boolean {
  for (const name of names) {
    const property = properties[name];

    if (isCheckboxProperty(property)) {
      return property.checkbox ?? false;
    }
  }

  return false;
}

function getDateProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
) {
  for (const name of names) {
    const property = properties[name];

    if (isDateProperty(property) && property.date?.start) {
      return property.date.start;
    }
  }

  return "";
}

function getMultiSelectProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
): string[] {
  for (const name of names) {
    const property = properties[name];

    if (isMultiSelectProperty(property)) {
      return property.multi_select.map((item) => item.name);
    }

    if (isSelectProperty(property) && property.select?.name) {
      return [property.select.name];
    }
  }

  return [];
}

function getFilePropertyUrl(
  properties: Record<string, NotionProperty>,
  names: string[],
) {
  for (const name of names) {
    const property = properties[name];

    if (!isFilesProperty(property)) {
      continue;
    }

    const firstFile = property.files[0];

    if (firstFile) {
      return getNotionFileUrl(firstFile);
    }
  }

  return null;
}

function getPeopleProperty(
  properties: Record<string, NotionProperty>,
  names: string[],
) {
  for (const name of names) {
    const property = properties[name];

    if (isPeopleProperty(property) && property.people.length > 0) {
      return property.people
        .map((person) => person.name)
        .filter(Boolean)
        .join(", ");
    }
  }

  return "";
}

function getIconValue(icon?: NotionIconObject) {
  if (!icon) {
    return null;
  }

  if (icon.type === "emoji") {
    return icon.emoji;
  }

  if (icon.type === "custom_emoji") {
    return icon.custom_emoji.url;
  }

  if (icon.type === "icon") {
    return null;
  }

  if (icon.type === "external") {
    return icon.external.url;
  }

  if (icon.type === "file") {
    return icon.file.url;
  }

  return null;
}

function getCloudinaryThumbnailUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  const uploadMarker = "/upload/";
  const markerIndex = url.indexOf(uploadMarker);

  if (markerIndex === -1) {
    return url;
  }

  return `${url.slice(0, markerIndex + uploadMarker.length)}f_auto,q_auto,c_fill,w_720,h_460/${url.slice(markerIndex + uploadMarker.length)}`;
}

async function getThumbnailImageFromProperties(
  properties: Record<string, NotionProperty>,
) {
  const thumbnailUrl =
    getFilePropertyUrl(properties, [
      "Thumbnail",
      "Card Image",
      "CardImage",
      "Preview Image",
      "Featured Image",
      "Cover Image",
      "Image",
    ]) ||
    getPlainTextProperty(properties, [
      "Thumbnail URL",
      "Card Image URL",
      "Preview Image URL",
      "Image URL",
    ]).trim();

  if (!thumbnailUrl) {
    return null;
  }

  const hostedThumbnailUrl = await getHostedImageUrl(thumbnailUrl);
  return getCloudinaryThumbnailUrl(hostedThumbnailUrl);
}

async function mapPageToSummary(page: NotionPage): Promise<BlogPostSummary | null> {
  const slug = getPlainTextProperty(page.properties, ["Slug"]).trim();
  const title = getPlainTextProperty(page.properties, ["Title", "Name"]).trim();

  if (!slug || !title) {
    return null;
  }

  const coverImage = await getHostedImageUrl(getNotionFileUrl(page.cover));
  const propertyThumbnailImage = await getThumbnailImageFromProperties(page.properties);

  return {
    id: page.id,
    slug,
    title,
    description:
      getPlainTextProperty(page.properties, [
        "Description",
        "Summary",
        "Excerpt",
      ]).trim() || "Fresh writing from Notion, published straight to the site.",
    publishedAt:
      getDateProperty(page.properties, ["Date", "Published At", "Publish Date"]) ||
      page.created_time,
    updatedAt: page.last_edited_time,
    coverImage,
    thumbnailImage: propertyThumbnailImage ?? getCloudinaryThumbnailUrl(coverImage),
    icon: getIconValue(page.icon),
    author:
      getPeopleProperty(page.properties, ["Author"]) ||
      getPlainTextProperty(page.properties, ["Author"]) ||
      siteConfig.author,
    tags: getMultiSelectProperty(page.properties, ["Tags", "Category", "Categories"]),
    featured: getCheckboxProperty(page.properties, ["Featured"]),
  };
}

async function queryPublishedPosts(options: QueryPublishedPostsOptions = {}) {
  const { cursor, filter, limit = 20 } = options;
  const baseFilter: DataSourceFilter = {
    property: "Published",
    checkbox: {
      equals: true,
    },
  };
  const composedFilter = filter
    ? ({ and: [baseFilter, filter] } as DataSourceFilter)
    : baseFilter;

  return withNotionRetry(() =>
    notion.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_ID,
      filter: composedFilter,
      start_cursor: cursor,
      page_size: limit,
      sorts: [
        {
          property: "Date",
          direction: "descending",
        },
      ],
    }),
  );
}

async function fetchPublishedPostsPage(options: QueryPublishedPostsOptions = {}) {
  const response = await queryPublishedPosts(options);
  const posts = await Promise.all(
    response.results.map((page) => mapPageToSummary(page as NotionPage)),
  );

  return {
    posts: posts.filter((post): post is BlogPostSummary => Boolean(post)),
    nextCursor: response.next_cursor ?? null,
    hasMore: response.has_more,
  } satisfies BlogPostsPage;
}

const getCachedPublishedPostsPage = unstable_cache(
  async (cursor?: string, filterKey?: string, limit = 20) => {
    return fetchPublishedPostsPage({
      cursor,
      filter: filterKey ? (JSON.parse(filterKey) as DataSourceFilter) : undefined,
      limit,
    });
  },
  ["published-posts-page"],
  {
    revalidate: BLOG_SUMMARY_REVALIDATE_SECONDS,
  },
);

export async function getPublishedPostsPage(options: QueryPublishedPostsOptions = {}) {
  const filterKey = options.filter ? JSON.stringify(options.filter) : undefined;

  return getCachedPublishedPostsPage(options.cursor, filterKey, options.limit ?? 20);
}

export async function getFreshPublishedPostsPage(
  options: QueryPublishedPostsOptions = {},
) {
  return fetchPublishedPostsPage(options);
}

export const getPublishedPosts = cache(async () => {
  const allPosts: BlogPostSummary[] = [];
  let cursor: string | undefined;

  do {
    const page = await getPublishedPostsPage({
      cursor,
      limit: 50,
    });

    allPosts.push(...page.posts);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return allPosts;
});

export async function getFreshPublishedPosts() {
  const allPosts: BlogPostSummary[] = [];
  let cursor: string | undefined;

  do {
    const page = await getFreshPublishedPostsPage({
      cursor,
      limit: 50,
    });

    allPosts.push(...page.posts);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);

  return allPosts;
}

export const getPosts = getPublishedPosts;

export const getHomepagePosts = cache(async () => {
  const [featuredPage, latestPage] = await Promise.all([
    getPublishedPostsPage({
      filter: {
        property: "Featured",
        checkbox: {
          equals: true,
        },
      },
      limit: 5,
    }),
    getPublishedPostsPage({
      limit: 18,
    }),
  ]);

  const mergedPosts = [...featuredPage.posts, ...latestPage.posts];
  const uniquePosts = mergedPosts.filter(
    (post, index, allPosts) =>
      allPosts.findIndex((candidate) => candidate.id === post.id) === index,
  );

  return uniquePosts.slice(0, 18);
});

const getCachedPostBySlug = unstable_cache(
  async (slug: string) => {
    const response = await queryPublishedPosts({
      limit: 1,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    const page = response.results[0] as NotionPage | undefined;

    if (!page) {
      return null;
    }

    const summary = await mapPageToSummary(page);

    if (!summary) {
      return null;
    }

    const content = await getBlogContentByPageId(summary.id, summary.updatedAt);

    return {
      ...summary,
      readingTime: content.readingTime,
      canonicalUrl: `${siteConfig.url}/blog/${summary.slug}`,
    } satisfies BlogPost;
  },
  ["post-by-slug"],
  {
    revalidate: BLOG_SUMMARY_REVALIDATE_SECONDS,
  },
);

export const getPostBySlug = cache(async (slug: string) => {
  return getCachedPostBySlug(slug);
});

export async function getRecentPosts(limit = 4, excludeSlug?: string) {
  const posts = await getPublishedPosts();

  return posts
    .filter((post) => post.slug !== excludeSlug)
    .slice(0, limit);
}

export async function getRelatedPosts(options: {
  slug: string;
  tags: string[];
  limit?: number;
}) {
  const { slug, tags, limit = 3 } = options;
  const normalizedTags = new Set(tags.map((tag) => tag.trim().toLowerCase()));
  const posts = await getPublishedPosts();

  const scoredPosts = posts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const score = post.tags.reduce((total, tag) => {
        return total + (normalizedTags.has(tag.trim().toLowerCase()) ? 1 : 0);
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
    .map((entry) => entry.post)
    .slice(0, limit);

  if (matchedPosts.length >= limit) {
    return matchedPosts;
  }

  const fallbackPosts = scoredPosts
    .filter((entry) => entry.score === 0)
    .map((entry) => entry.post)
    .slice(0, limit - matchedPosts.length);

  return [...matchedPosts, ...fallbackPosts];
}
