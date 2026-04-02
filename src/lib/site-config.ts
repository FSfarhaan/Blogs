export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Farhaan Shaikh Blogs",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME ?? "FS Blogs",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ??
    "A clean personal blog for sharing engineering lessons, code experiments, and product thinking.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  author: process.env.NEXT_PUBLIC_AUTHOR_NAME ?? "Farhaan Shaikh",
  role: process.env.NEXT_PUBLIC_AUTHOR_ROLE ?? "Full-stack web and mobile app developer",
  intro:
    process.env.NEXT_PUBLIC_SITE_INTRO ??
    "I write about building things that actually work. Modern web, AI, and the lessons you don’t learn in tutorials.",
  newsletterTitle: "Join the newsletter",
  newsletterDescription:
    "Get new posts in your inbox whenever a fresh article goes live.",
};

export const navigationLinks = [
  { href: "/", label: "Home" },
  { href: "/blogs", label: "Blogs" },
];

export const categoryList = [
  "Software",
  "Architecture",
  "AI",
  "Practices",
  "Personal",
  "College",
];
