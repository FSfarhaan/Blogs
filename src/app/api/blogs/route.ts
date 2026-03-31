import { NextRequest, NextResponse } from "next/server";
import { getPublishedPostsPage } from "@/lib/blog-store";

export const runtime = "nodejs";
export const revalidate = 900;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor") || undefined;
  const limitParam = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 24)
    : 9;

  const page = await getPublishedPostsPage({
    cursor,
    limit,
  });

  return NextResponse.json(page, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
