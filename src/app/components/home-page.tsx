import Link from "next/link";
import { EmptyState } from "@/app/components/empty-state";
import { PostCard } from "@/app/components/post-card";
import { SubscribeSection } from "@/app/components/subscribe-section";
import type { BlogPostSummary } from "@/lib/blog";
import { categoryList, siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Props = {
  posts: BlogPostSummary[];
};

function getDisplayImage(post: BlogPostSummary) {
  return post.thumbnailImage ?? post.coverImage;
}

function PostCover({
  post,
  className,
}: {
  post: BlogPostSummary;
  className: string;
}) {
  const displayImage = getDisplayImage(post);

  if (displayImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Blog cover images come from remote CMS sources, so a plain img keeps this editorial layout reliable.
      <img src={displayImage} alt={post.title} className={className} />
    );
  }

  return (
    <div
      className={`${className} flex items-end bg-[linear-gradient(145deg,#fff4ea,#fde1d4_48%,#efe7ff)] p-4`}
    >
      <span className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {post.tags[0] ?? "Latest"}
      </span>
    </div>
  );
}

export function HomePage({ posts }: Props) {
  const featuredPool = posts.filter((post) => post.featured);
  const fallbackPool = posts.filter((post) => !post.featured);
  const featuredPosts = [...featuredPool, ...fallbackPool].slice(0, 5);
  const discoverPosts = posts
    .filter((post) => !featuredPosts.some((featuredPost) => featuredPost.id === post.id))
    .slice(0, 6);
  const primaryFeaturedPost = featuredPosts[0];
  const secondaryFeaturedPosts = featuredPosts.slice(1, 5);
  const categoryImages = [
    "/category-technology.svg",
    "/category-lifestyle.svg",
    "/category-arts.svg",
    "/category-design.svg",
    "/category-entertainment.svg",
    "/category-education.svg",
  ];

  return (
    <main className="mx-auto flex w-full max-w-[90%] flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
      <section className="grid gap-7">
        <div className="space-y-8">
          <div className="rounded-[2.25rem] p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
              Hi there,
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <h1 className="max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.05em] text-[var(--foreground)] md:text-[4.5rem]">
                  I am Farhaan Shaikh,
                  <span className="block text-[var(--accent)]">
                    A Full Stack Dev.
                  </span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                  {siteConfig.intro}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="#latest-posts"
                    className="inline-flex items-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)]"
                  >
                    Start reading
                  </Link>
                  <Link
                    href="#subscribe"
                    className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Join the newsletter
                  </Link>
                </div>
              </div>

              <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
                <div className="relative overflow-hidden rounded-[2.35rem] border border-[var(--border)] bg-[linear-gradient(155deg,rgba(255,250,244,0.96),rgba(247,235,225,0.92))] p-4 shadow-[var(--shadow-soft)]">
                  <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[color:rgba(239,109,67,0.16)] blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-[color:rgba(107,91,210,0.12)] blur-3xl" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[var(--surface-strong)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- Local hero portrait is intentionally rendered as a simple cropped image for this editorial card. */}
                    <img
                      src="/pfp.jpeg"
                      alt={`${siteConfig.author} portrait`}
                      className="aspect-[4/5] w-full object-cover object-center"
                    />
                  </div>

                  <div className="relative mt-4 rounded-[1.5rem] border border-white/70 bg-white/72 px-5 py-4 backdrop-blur">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                      I am {siteConfig.author}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                      Building polished web experiences, writing about the systems behind
                      them, and publishing the whole thing straight from Notion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="rounded-[2rem] border border-[var(--border)] bg-[color:rgba(255,250,244,0.88)] p-8 shadow-[var(--shadow-soft)] mt-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Categories
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                What I write about
              </h2>
            </div>

            <div className="mt-8 grid gap-4 grid-cols-7">
              {categoryList.map((category, index) => (
                <div
                  key={category}
                  className="rounded-[1.75rem]  p-5"
                >
                  <div className="w-full overflow-hidden rounded-[1.6rem] ">
                    {/* eslint-disable-next-line @next/next/no-img-element -- These are local placeholder category images that will be swapped later, and a simple img keeps the card interior easy to replace. */}
                    <img
                      src={categoryImages[index % categoryImages.length]}
                      alt={`${category} placeholder`}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[var(--foreground)] text-center">
                    {category}
                  </p>
                  {/* <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    Practical notes and sharp takes on {category.toLowerCase()}.
                  </p> */}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section id="latest-posts" className="rounded-[2.25rem]">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between p-8 pb-0">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Featured blogs
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              If you&apos;re new, start here
            </h2>
          </div>
        </div>

        {primaryFeaturedPost ? (
          <div className="grid gap-6 rounded-[2.3rem] border border-[var(--border)] bg-[color:rgba(255,250,244,0.88)] p-4 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-strong)] xl:min-h-[44rem] xl:grid-cols-[minmax(0,1.12fr)_24rem]">
            <article className="group flex h-full flex-col overflow-hidden">
              <Link href={`/blog/${primaryFeaturedPost.slug}`} className="block">
                <div className="relative overflow-hidden rounded-[1.8rem] border border-white/75 bg-[var(--surface-strong)]">
                  <PostCover
                    post={primaryFeaturedPost}
                    className="aspect-[16/10] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-[color:rgba(239,109,67,0.94)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      {primaryFeaturedPost.tags[0] ?? "Featured"}
                    </span>
                    <span className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {formatDate(primaryFeaturedPost.publishedAt)}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="flex flex-1 flex-col justify-between space-y-5 px-2 pb-2 pt-6 md:px-4">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  <span>{primaryFeaturedPost.author}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
                  <span>
                    {primaryFeaturedPost.tags[1] ??
                      primaryFeaturedPost.tags[0] ??
                      "Highlighted"}
                  </span>
                </div>

                <div>
                  <h3 className="line-clamp-2 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-[var(--foreground)] md:text-[2.65rem]">
                    <Link
                      href={`/blog/${primaryFeaturedPost.slug}`}
                      className="transition hover:text-[var(--accent)]"
                    >
                      {primaryFeaturedPost.title}
                    </Link>
                  </h3>
                  <p className="mt-4 line-clamp-3 max-w-2xl text-base leading-8 text-[var(--muted)]">
                    {primaryFeaturedPost.description}
                  </p>
                </div>

                <Link
                  href={`/blog/${primaryFeaturedPost.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--accent)]"
                >
                  Continue reading
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <div className="grid gap-4 xl:h-full xl:grid-rows-4">
              {secondaryFeaturedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group grid h-full grid-cols-[8.75rem_minmax(0,1fr)] gap-4 rounded-[1.9rem] border border-[var(--border)] bg-[linear-gradient(165deg,rgba(255,251,246,0.94),rgba(248,239,229,0.9))] p-3 shadow-[0_12px_28px_rgba(88,62,41,0.05)] transition duration-300 hover:-translate-y-1 hover:border-[color:rgba(239,109,67,0.24)] hover:shadow-[var(--shadow-soft)]"
                >
                  <div className="h-full overflow-hidden rounded-[1.35rem] border border-white/70 bg-[var(--surface-strong)]">
                    <PostCover
                      post={post}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col justify-center py-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      <span>{post.tags[0] ?? "Feature"}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-lg font-semibold leading-6 tracking-tight text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
                      {post.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                      {post.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No published posts yet"
            description="Once your Notion data source has published posts, they will appear here automatically."
          />
        )}
      </section>

      <section className="rounded-[2.25rem] md:p-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Discover more
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              More from the blogs
            </h2>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            View more
          </Link>
        </div>

        {discoverPosts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {discoverPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nothing in the archive yet"
            description="The archive will fill up here as your published posts grow over time."
          />
        )}
      </section>

      <SubscribeSection />
    </main>
  );
}
