import type { ReactNode } from "react";
import Link from "next/link";
import { EmptyState } from "@/app/components/empty-state";
import { PostCard } from "@/app/components/post-card";
import { SubscribeForm } from "@/app/components/subscribe-form";
import type { BlogPostSummary } from "@/lib/blog";
import type { SiteAnalyticsSummary } from "@/lib/site-analytics";
import { categoryList, siteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils";

type Props = {
  posts: BlogPostSummary[];
  subscriberCount: number;
  analyticsSummary: SiteAnalyticsSummary;
};

type SocialLink = {
  href: string;
  label: string;
  icon: ReactNode;
};

function CategoryArtwork({ category }: { category: string }) {
  const frameClassName =
    "flex aspect-square w-full items-center justify-center rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-soft)]";
  const svgClassName = "h-full w-full";

  switch (category) {
    case "Software":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <rect x="18" y="24" width="84" height="58" rx="12" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <path d="M47 47L34 58L47 69" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M73 47L86 58L73 69" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M66 40L55 76" stroke="var(--secondary)" strokeWidth="7" strokeLinecap="round" />
            <rect x="38" y="91" width="44" height="8" rx="4" fill="var(--accent-glow)" />
          </svg>
        </div>
      );
    case "Architecture":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <rect x="18" y="22" width="34" height="34" rx="8" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <rect x="68" y="22" width="34" height="20" rx="8" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <rect x="68" y="56" width="34" height="34" rx="8" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <rect x="18" y="70" width="34" height="20" rx="8" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <path d="M52 39H68" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
            <path d="M35 56V70" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
            <path d="M85 42V56" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "AI":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <rect x="31" y="22" width="58" height="72" rx="18" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <circle cx="46" cy="43" r="7" fill="var(--secondary)" />
            <circle cx="74" cy="43" r="7" fill="var(--secondary)" />
            <path d="M46 43H74" stroke="var(--secondary)" strokeWidth="5" strokeLinecap="round" />
            <path d="M46 43L60 60L74 43" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M43 76C48 69 54 66 60 66C66 66 72 69 77 76" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M60 13V22M39 17L43 24M81 17L77 24" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Education":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <path d="M18 40L60 22L102 40L60 58L18 40Z" fill="var(--secondary-soft)" stroke="var(--secondary)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M31 48V73C31 82 47 90 60 90C73 90 89 82 89 73V48" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M102 40V66" stroke="var(--secondary)" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="102" cy="74" r="7" fill="var(--accent)" />
            <path d="M50 69H70" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Best Practices":
    case "Practices":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <rect x="28" y="16" width="64" height="88" rx="14" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <path d="M42 44L48 50L58 37" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 64L48 70L58 57" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 84L48 90L58 77" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M68 44H79" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M68 64H79" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M68 84H79" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "Personal":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <path d="M26 33C26 25.82 31.82 20 39 20H81C88.18 20 94 25.82 94 33V66C94 73.18 88.18 79 81 79H56L41 93V79H39C31.82 79 26 73.18 26 66V33Z" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M42 42H78" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M42 54H73" stroke="var(--foreground)" strokeWidth="5" strokeLinecap="round" />
            <path d="M42 66H64" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
            <circle cx="84" cy="88" r="10" fill="var(--secondary-soft)" />
            <path d="M84 84V92M80 88H88" stroke="var(--secondary)" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "College":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <path d="M18 42L60 24L102 42L60 60L18 42Z" fill="var(--secondary-soft)" stroke="var(--secondary)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M33 50V72C33 81 49 88 60 88C71 88 87 81 87 72V50" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M102 42V67" stroke="var(--secondary)" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="102" cy="76" r="7" fill="var(--accent)" />
          </svg>
        </div>
      );
    case "Opinions":
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <path d="M20 32C20 24.27 26.27 18 34 18H68C75.73 18 82 24.27 82 32V58C82 65.73 75.73 72 68 72H46L34 82V72C26.27 72 20 65.73 20 58V32Z" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" strokeLinejoin="round" />
            <path d="M58 84H86C93.73 84 100 77.73 100 70V50C100 42.27 93.73 36 86 36H82" stroke="var(--secondary)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="41" cy="45" r="5" fill="var(--accent)" />
            <circle cx="52" cy="45" r="5" fill="var(--secondary)" />
            <circle cx="63" cy="45" r="5" fill="#59B28A" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={frameClassName}>
          <svg aria-hidden="true" viewBox="0 0 120 120" className={svgClassName} fill="none">
            <circle cx="60" cy="60" r="26" fill="var(--surface-muted)" stroke="var(--border)" strokeWidth="4" />
            <path d="M60 47V73M47 60H73" stroke="var(--accent)" strokeWidth="6" strokeLinecap="round" />
          </svg>
        </div>
      );
  }
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3A1.97 1.97 0 1 0 5.3 6.94 1.97 1.97 0 0 0 5.25 3Zm14.7 9.88c0-3.47-1.85-5.08-4.32-5.08a3.72 3.72 0 0 0-3.36 1.85V8.5H8.9c.04.76 0 11.5 0 11.5h3.38v-6.42c0-.34.02-.68.12-.92.27-.68.89-1.38 1.93-1.38 1.36 0 1.9 1.04 1.9 2.56V20h3.38v-7.12Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 .5a12 12 0 0 0-3.8 23.39c.6.1.82-.26.82-.58v-2.04c-3.34.72-4.04-1.42-4.04-1.42-.54-1.4-1.33-1.76-1.33-1.76-1.08-.75.08-.73.08-.73 1.2.09 1.82 1.22 1.82 1.22 1.06 1.82 2.8 1.3 3.48 1 .1-.77.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.95 0-1.32.46-2.39 1.22-3.23-.13-.3-.53-1.53.11-3.18 0 0 1-.32 3.27 1.23a11.2 11.2 0 0 1 5.95 0c2.27-1.55 3.26-1.23 3.26-1.23.64 1.65.24 2.88.12 3.18.76.84 1.22 1.9 1.22 3.23 0 4.62-2.8 5.63-5.48 5.94.44.38.82 1.12.82 2.28v3.36c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4.5 7 7.5 6L19.5 7" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 64"
      className="h-11 w-11 -rotate-10 drop-shadow-[0_10px_20px_rgba(28,42,160,0.22)]"
      fill="none"
    >
      <path
        d="M8 6L52 34L28 36L18 58L8 6Z"
        fill="#ffffff"
        stroke="#ef6d43"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const socialLinks: SocialLink[] = [
  {
    href: "https://www.farhaanshaikh.dev",
    label: "Portfolio",
    icon: <GlobeIcon />,
  },
  {
    href: "https://www.linkedin.com/in/fsfarhaanshaikh",
    label: "LinkedIn",
    icon: <LinkedInIcon />,
  },
  {
    href: "https://github.com/FSfarhaan",
    label: "GitHub",
    icon: <GitHubIcon />,
  },
  {
    href: "mailto:fsfarhaanshaikh7@gmail.com",
    label: "Email",
    icon: <MailIcon />,
  },
  {
    href: "http://instagram.com/the_farhaanshaikh",
    label: "Instagram",
    icon: <InstagramIcon />,
  },
];

function getDisplayImage(post: BlogPostSummary) {
  return post.thumbnailImage ?? post.coverImage;
}

function formatTrafficCount(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }

  return value.toLocaleString();
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
      className={`${className} flex items-end [background:var(--placeholder-gradient)] p-4`}
    >
      <span className="rounded-full border border-(--border-strong) bg-(--surface-pill) px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--muted)">
        {post.tags[0] ?? "Latest"}
      </span>
    </div>
  );
}

export function HomePage({ posts, subscriberCount, analyticsSummary }: Props) {
  const featuredPool = posts.filter((post) => post.featured);
  const fallbackPool = posts.filter((post) => !post.featured);
  const featuredPosts = [...featuredPool, ...fallbackPool].slice(0, 5);
  const discoverPosts = posts
    .filter(
      (post) =>
        !featuredPosts.some((featuredPost) => featuredPost.id === post.id),
    )
    .slice(0, 6);
  const primaryFeaturedPost = featuredPosts[0];
  const secondaryFeaturedPosts = featuredPosts.slice(1, 5);
  const subscriberCountLabel =
    subscriberCount > 0 ? subscriberCount.toLocaleString() : "100+";
  const trafficCountLabel = formatTrafficCount(analyticsSummary.totalPageViews);
  const weeklyTrafficChange = analyticsSummary.weeklyTrafficChange;
  const hasTrafficTrend = weeklyTrafficChange !== null;
  const trafficTrendLabel = hasTrafficTrend
    ? `${weeklyTrafficChange >= 0 ? "+" : ""}${weeklyTrafficChange}% this week`
    : "";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-6 sm:px-6 lg:px-8 md:py-10">
      <section className="grid gap-7">
        <div className="space-y-12 md:space-y-16">
          <div className="rounded-[2.25rem] pb-6 md:pb-10">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-3xl">

                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-(--muted)">
                  Hi there,
                </p>
                <h1 className="max-w-5xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-(--foreground) sm:text-5xl lg:text-[4.5rem]">
                  I am Farhaan,
                  <span className="block text-(--accent)">
                    A Full Stack Dev.
                  </span>
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-(--muted) sm:text-lg sm:leading-8">
                  {siteConfig.intro}
                </p>

                <div className="mt-6">
                  <SubscribeForm
                    compact
                    placeholder="Enter your email for newsletter"
                    buttonLabel="Subscribe"
                    idleMessage="Drop your email to get the next article first."
                    inputClassName="h-[3.25rem] bg-[var(--surface)]"
                    buttonClassName="h-[3.25rem] px-6"
                  />
                </div>

                <div className="mt-5 flex items-start gap-3">
                  <div className="flex -space-x-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-(--surface) bg-(--surface-strong) text-xs">
                      SK
                    </span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-(--surface) bg-[linear-gradient(135deg,var(--accent),#ffb26f)] text-xs font-semibold text-white">
                      SR
                    </span>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-(--surface) bg-[linear-gradient(135deg,var(--secondary),#8dc8ff)] text-xs font-semibold text-white">
                      AS
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-6 text-(--foreground)"> Join <span className="font-semibold">{subscriberCountLabel}+</span> subscribers.
                    </p>
                    <p className="text-sm text-(--muted)">
                      To receive notifications whenever a new post goes live.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-auto w-full max-w-88 sm:max-w-xl lg:mx-0 lg:justify-self-end">
                <div className="relative isolate min-h-100 rounded-[2.8rem] sm:min-h-120 lg:min-h-128">
                  <div className="absolute inset-0 rounded-[2.8rem] bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-size-[18px_18px] opacity-70" />
                  <div className="pointer-events-none absolute -left-8 top-16 h-40 w-40 rounded-full bg-(--accent-glow) blur-3xl" />
                  <div className="pointer-events-none absolute bottom-8 right-8 h-44 w-44 rounded-full bg-(--secondary-soft) blur-3xl" />


                  <div className="absolute -right-4 top-0 z-20 hidden flex-col gap-3 rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface-pill-strong)] p-3 shadow-[var(--shadow-soft)] sm:flex">
                    {socialLinks.map((socialLink, index) => (
                      <a
                        key={`${socialLink.label}-rail`}
                        href={socialLink.href}
                        title={socialLink.label}
                        aria-label={socialLink.label}
                        target="_blank"
                        rel="noreferrer"
                        className={`group relative inline-flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[var(--surface)] text-(--foreground) transition hover:scale-[1.03] hover:text-[var(--accent)] ${
                          index === 0 ? "text-[var(--accent)]" : ""
                        }`}
                      >
                        {socialLink.icon}
                        <span className="pointer-events-none absolute right-[calc(100%+0.75rem)] top-1/2 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--surface-pill-strong)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--foreground) opacity-0 transition duration-200 group-hover:opacity-100">
                          {socialLink.label}
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="absolute bottom-8 right-0 z-20 w-[11.5rem] rounded-[1.2rem] border border-[var(--border)] bg-[var(--surface-pill-strong)] px-3 py-3 shadow-[var(--shadow-soft)] sm:bottom-12 sm:right-4 sm:w-[16.5rem] sm:px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                          Traffic
                        </p>
                        <p className="mt-2 text-[1.35rem] font-semibold leading-none tracking-tight text-(--foreground) sm:text-[1.9rem]">
                          {trafficCountLabel} visits
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-(--muted) sm:text-xs">
                          since last month
                        </p>
                      </div>
                      {hasTrafficTrend ? (
                        <span className="rounded-full bg-[var(--surface)] px-2 py-1 text-[9px] font-semibold text-[#59B28A] sm:px-2.5 sm:text-[10px]">
                          {trafficTrendLabel}
                        </span>
                      ) : null}
                    </div>
                    {/* <div className="mt-3 rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                        Reading time
                      </p>
                      <p className="mt-1.5 text-base font-semibold text-(--foreground)">
                        {totalReadingTimeLabel}
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-(--muted)">
                        readers spent on-site
                      </p>
                    </div> */}
                  </div>

                  <div className="absolute left-0 -top-16 z-20 max-w-[10.5rem] rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-pill-strong)] px-4 py-3 shadow-[var(--shadow-soft)] sm:-left-10 sm:top-6 sm:max-w-none sm:px-5 sm:py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--muted) sm:text-xs">
                      Published now
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-(--foreground) sm:text-3xl">
                      {posts.length}
                    </p>
                    <p className="mt-1 text-xs text-(--muted) sm:text-sm">
                      articles live on the site
                    </p>
                  </div>

                  <div className="absolute left-2/3 top-[52%] z-20 -translate-x-1/2 sm:block">
                    <span className="pointer-events-none absolute -left-4 -top-2">
                      <CursorIcon />
                    </span>
                    <div className="rounded-full border border-[var(--border)] bg-[var(--surface-pill-strong)] px-4 py-2 text-sm font-medium text-(--foreground) shadow-[var(--shadow-soft)] mt-4">
                      Focussed
                    </div>
                  </div>

                  <div className="relative mx-auto mt-16 max-w-[18rem] rounded-[2.3rem] border border-[var(--border)] [background:var(--hero-card-gradient)] p-3 shadow-[var(--shadow-soft)] sm:mt-10 sm:max-w-[25rem] sm:p-4">
                    <div className="overflow-hidden rounded-[2rem] border border-[var(--border-strong)] bg-[var(--surface-strong)]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- Local hero portrait is intentionally rendered as a simple image centerpiece for the editorial hero collage. */}
                      <img
                        src="/pfp.jpeg"
                        alt={`${siteConfig.author} portrait`}
                        className="aspect-[4/4.3] w-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-12 rounded-[2rem] border border-[var(--border)] bg-[var(--feature-surface)] p-5 shadow-[var(--shadow-soft)] sm:p-6 md:mt-16 md:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--muted)">
                Categories
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-(--foreground) sm:text-3xl">
                What I write about
              </h2>
            </div>

            <div className="mt-6 grid gap-3 grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {categoryList.map((category) => (
                <div key={category} className="min-w-0 rounded-[1.5rem] p-2 pb-0 sm:rounded-[1.75rem] sm:p-4 sm:pb-0">
                  <div className="w-full overflow-hidden rounded-[1.6rem] ">
                    <CategoryArtwork category={category} />
                  </div>
                  <p className="mt-3 text-center text-xs font-semibold leading-snug text-(--foreground) sm:mt-4 sm:text-base md:text-lg">
                    {category}
                  </p>
                  {/* <p className="mt-2 text-sm leading-6 text-(--muted)">
                    Practical notes and sharp takes on {category.toLowerCase()}.
                  </p> */}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section id="latest-posts" className="rounded-[2.25rem]">
        <div className="mb-6 flex flex-col gap-4 px-0 pb-0 pt-0 md:mb-8 md:flex-row md:items-end md:justify-between md:p-8 md:px-0 md:pb-0">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--muted)">
              Featured blogs
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--foreground) md:text-4xl">
              If you&apos;re new, start here
            </h2>
          </div>
        </div>

        {primaryFeaturedPost ? (
          <div className="grid gap-4 rounded-[2.3rem] transition duration-300 sm:gap-6 xl:min-h-[44rem] xl:grid-cols-[minmax(0,1.12fr)_24rem]">
            <Link href={`/blog/${primaryFeaturedPost.slug}`}
                className="block"
              >
            <article className="group flex h-full flex-col overflow-hidden rounded-[2.3rem] border border-[var(--border-strong)] bg-[var(--surface-strong)] p-3 transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-strong)] [background:var(--feature-item-gradient)] sm:p-4">
                
                <div className="relative overflow-hidden rounded-[1.8rem] border border-[var(--border-strong)] bg-[var(--surface-strong)]">
                  <PostCover
                    post={primaryFeaturedPost}
                    className="aspect-[16/10] w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[color:rgba(239,109,67,0.94)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                      {primaryFeaturedPost.tags[0] ?? "Featured"}
                    </span>
                    <span className="rounded-full border border-[var(--border-strong)] bg-[var(--surface-pill-strong)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--muted)">
                      {formatDate(primaryFeaturedPost.publishedAt)}
                    </span>
                  </div>
                </div>

              
              <div className="flex flex-1 flex-col justify-between space-y-4 px-1 pb-1 pt-5 sm:space-y-5 md:px-4">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--muted) sm:gap-3 sm:text-[11px]">
                  <span>{primaryFeaturedPost.author}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
                  <span>
                    {primaryFeaturedPost.tags[1] ??
                      primaryFeaturedPost.tags[0] ??
                      "Highlighted"}
                  </span>
                </div>

                <div>
                  <h3 className="line-clamp-2 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-(--foreground) group-hover:text-[var(--accent)] md:text-[2.65rem]">
                    <div
                      className="transition hover:text-[var(--accent)]"
                    >
                      {primaryFeaturedPost.title}
                    </div>
                  </h3>
                  <p className="mt-4 line-clamp-3 max-w-2xl text-sm leading-7 text-(--muted) md:text-base md:leading-8">
                    {primaryFeaturedPost.description}
                  </p>
                </div>

                <div
                  
                  className="inline-flex items-center gap-2 text-sm font-semibold text-(--foreground) transition group-hover:text-[var(--accent)]"
                >
                  View article
                  <span aria-hidden="true">→</span>
                </div>
              </div>
            </article>
            </Link>

            <div className="grid gap-4 xl:h-full xl:grid-rows-4">
              {secondaryFeaturedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group grid h-full grid-cols-[6.5rem_minmax(0,1fr)] gap-3 rounded-[1.6rem] border border-[var(--border)] [background:var(--feature-item-gradient)] p-2.5 shadow-[var(--shadow-soft)] transition duration-300 hover:-translate-y-1 hover:border-[var(--accent)] hover:shadow-[var(--shadow-strong)] sm:grid-cols-[8.75rem_minmax(0,1fr)] sm:gap-4 sm:rounded-[1.9rem] sm:p-3"
                >
                  <div className="h-full overflow-hidden rounded-[1.35rem] border border-[var(--border-strong)] bg-[var(--surface-strong)]">
                    <PostCover
                      post={post}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.04]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col justify-center py-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                      <span>{post.tags[0] ?? "Feature"}</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--muted)]" />
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-lg font-semibold leading-6 tracking-tight text-(--foreground) transition group-hover:text-[var(--accent)]">
                      {post.title}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-(--muted)">
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

      <section className="rounded-[2.25rem] md:p-10 md:px-0">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-(--muted)">
              Discover more
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-(--foreground) md:text-4xl">
              More from the blogs
            </h2>
          </div>
          <Link
            href="/blogs"
            className="hidden items-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm font-semibold text-(--foreground) transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:inline-flex"
          >
            View more
          </Link>
        </div>

        {discoverPosts.length ? (
          <>
            <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {discoverPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Link
              href="/blogs"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-5 py-2.5 text-sm font-semibold text-(--foreground) transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
            >
              View more
            </Link>
          </>
        ) : (
          <EmptyState
            title="Nothing in the archive yet"
            description="The archive will fill up here as your published posts grow over time."
          />
        )}
      </section>
    </main>
  );
}
