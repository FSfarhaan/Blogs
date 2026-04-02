import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotionContent } from "@/app/components/notion-content";
import { PostCard } from "@/app/components/post-card";
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from "@/lib/blog-store";
import { formatDate, getTagTone } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 900;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post not found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: post.coverImage
        ? [{ url: post.coverImage }]
        : post.thumbnailImage
          ? [{ url: post.thumbnailImage }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage
        ? [post.coverImage]
        : post.thumbnailImage
          ? [post.thumbnailImage]
          : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts({
    slug: post.slug,
    tags: post.tags,
    limit: 3,
  });

  return (
    <main className="mx-auto w-full max-w-[90%] px-6 py-8 md:px-10 md:py-10">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="min-w-0">
          <div className="rounded-[2.25rem] border border-[var(--border)]  p-8 shadow-[var(--shadow-soft)] md:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                aria-label="Go back to blogs"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-pill)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <span aria-hidden="true">←</span>
              </Link>
              <Link
                href="/"
                className="inline-flex text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                Back to blogs
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{post.author}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
              <span>{post.readingTime}</span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-6xl">
              {post.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)] md:text-lg">
              {post.description}
            </p>

            {/* {heroImage ? (
              <div className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--border-strong)]">
                <img
                  src={heroImage}
                  alt={post.title}
                  className="h-auto w-full object-cover"
                />
              </div>
            ) : null} */}

          
            <div className="">
              <NotionContent
                content={{
                  pageId: post.notionPageId,
                  blocks: post.blocks,
                  wordCount: post.wordCount,
                  readingTime: post.readingTime,
                  generatedAt: post.generatedAt,
                }}
              />
            </div>
          
          </div>

        </article>

        <aside className="custom-scrollbar space-y-6 xl:sticky xl:top-6  xl:overflow-y-auto xl:pr-1">
          <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 ">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Post details
            </p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[var(--muted)]">
              <div>
                <p className="font-semibold text-[var(--foreground)]">Published</p>
                <p>{formatDate(post.publishedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Updated</p>
                <p>{formatDate(post.updatedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Read time</p>
                <p>{post.readingTime}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--foreground)]">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(post.tags.length ? post.tags : ["Article"]).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.04em]"
                      style={getTagTone(tag)}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {relatedPosts.length ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Related posts
              </p>
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} priority="featured" />
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
