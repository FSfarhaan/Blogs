import { HomePage } from "@/app/components/home-page";
import { getHomepagePosts } from "@/lib/blog-store";
import { getSubscriberCount } from "@/lib/firebase";
import { getSiteAnalyticsSummary } from "@/lib/site-analytics";

export const revalidate = 900;

export default async function Home() {
  const [posts, subscriberCount, analyticsSummary] = await Promise.all([
    getHomepagePosts(),
    getSubscriberCount().catch(() => 0),
    getSiteAnalyticsSummary().catch(() => ({
      totalPageViews: 0,
      totalReadingSeconds: 0,
      weeklyTrafficChange: null,
    })),
  ]);

  return (
    <HomePage
      posts={posts}
      subscriberCount={subscriberCount}
      analyticsSummary={analyticsSummary}
    />
  );
}
