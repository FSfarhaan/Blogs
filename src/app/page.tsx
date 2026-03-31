import { HomePage } from "@/app/components/home-page";
import { getHomepagePosts } from "@/lib/blog-store";

export const revalidate = 900;

export default async function Home() {
  const posts = await getHomepagePosts();

  return <HomePage posts={posts} />;
}
