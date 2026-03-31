import type { Metadata } from "next";
import { AdminAuthPanel } from "@/app/components/admin-auth-panel";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { getAdminDashboardData } from "@/lib/admin-posts";
import { isAdminAuthenticated } from "@/lib/admin-auth-server";

export const metadata: Metadata = {
  title: "Admin",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="mx-auto flex w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <AdminAuthPanel />
      </main>
    );
  }

  const { posts, syncStatus } = await getAdminDashboardData();

  return (
    <main className="mx-auto flex w-full max-w-7xl px-6 py-10 md:px-10 md:py-14">
      <div className="w-full">
        <AdminDashboard initialPosts={posts} initialSyncStatus={syncStatus} />
      </div>
    </main>
  );
}
