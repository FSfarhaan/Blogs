import type { Metadata } from "next";
import { BlogsFeed } from "@/app/components/blogs-feed";
import { getPublishedPosts } from "@/lib/blog-store";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Browse the full archive of published posts.",
};

export const revalidate = 900;

export default async function BlogsPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 md:py-10">
      <BlogsFeed initialPosts={posts} />
    </main>
  );
}
