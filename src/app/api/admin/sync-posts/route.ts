import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth-server";
import { syncPublishedPostsFromNotion } from "@/lib/notion-sync";

export const runtime = "nodejs";

export async function POST() {
  try {
    if (!(await isAdminAuthenticated())) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const result = await syncPublishedPostsFromNotion();

    revalidatePath("/");
    revalidatePath("/blogs");
    revalidatePath("/api/blogs");
    revalidatePath("/sitemap.xml");
    for (const slug of result.syncedSlugs) {
      revalidatePath(`/blog/${slug}`);
    }

    return Response.json({
      message:
        result.syncedNow > 0 || result.removed > 0
          ? `Sync complete. ${result.syncedNow} post(s) updated, ${result.removed} removed, ${result.skipped} already current.`
          : "Everything is already up to date.",
      syncStatus: {
        upToDate: result.upToDate,
        notionCount: result.notionCount,
        syncedCount: result.syncedCount,
        staleCount: result.staleCount,
        lastSyncedAt: result.lastSyncedAt,
      },
      syncedNow: result.syncedNow,
      skipped: result.skipped,
      removed: result.removed,
      syncedSlugs: result.syncedSlugs,
    });
  } catch (error) {
    console.error("Admin sync posts error", error);

    return Response.json(
      { error: "Unable to sync posts right now." },
      { status: 500 },
    );
  }
}
