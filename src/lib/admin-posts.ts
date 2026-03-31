import { FieldValue } from "firebase-admin/firestore";
import { getFreshPublishedPosts } from "@/lib/blog";
import { getPostNotificationCollection } from "@/lib/firebase";
import { getBlogSyncStatus } from "@/lib/notion-sync";
import type {
  AdminDashboardPost,
  AdminDashboardSyncStatus,
} from "@/lib/admin-types";

async function getNotificationStatusMap() {
  const snapshot = await getPostNotificationCollection().get();

  return new Map(
    snapshot.docs.map((doc) => {
      const data = doc.data() as { emailSent?: boolean };
      return [doc.id, data.emailSent === true];
    }),
  );
}

export async function getAdminDashboardPosts(): Promise<AdminDashboardPost[]> {
  const [posts, statusMap] = await Promise.all([
    getFreshPublishedPosts(),
    getNotificationStatusMap(),
  ]);

  return posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    publishedAt: post.publishedAt,
    emailSent: statusMap.get(post.slug) ?? false,
  }));
}

export async function getAdminDashboardData(): Promise<{
  posts: AdminDashboardPost[];
  syncStatus: AdminDashboardSyncStatus;
}> {
  const [posts, syncStatus] = await Promise.all([
    getAdminDashboardPosts(),
    getBlogSyncStatus(),
  ]);

  return { posts, syncStatus };
}

export async function setPostEmailSent(slug: string, emailSent: boolean) {
  await getPostNotificationCollection().doc(slug).set(
    {
      slug,
      emailSent,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
