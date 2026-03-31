import type { BlogPostSummary } from "@/lib/blog";

export type AdminDashboardPost = Pick<
  BlogPostSummary,
  "id" | "slug" | "title" | "description" | "publishedAt"
> & {
  emailSent: boolean;
};

export type AdminDashboardSyncStatus = {
  upToDate: boolean;
  notionCount: number;
  syncedCount: number;
  staleCount: number;
  lastSyncedAt: string | null;
};
