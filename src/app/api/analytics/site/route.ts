import { NextRequest } from "next/server";
import {
  getSiteAnalyticsSummary,
  recordSitePageView,
  recordSiteReadingTime,
} from "@/lib/site-analytics";

export const runtime = "nodejs";

type AnalyticsRequestBody = {
  type?: "page_view" | "time_on_page";
  path?: string;
  seconds?: number;
  occurredAt?: string;
};

function shouldIgnorePath(path?: string) {
  if (!path) {
    return true;
  }

  return path.startsWith("/admin");
}

export async function GET() {
  try {
    const summary = await getSiteAnalyticsSummary();
    return Response.json(summary);
  } catch (error) {
    console.error("Site analytics fetch error", error);

    return Response.json(
      { error: "Unable to load analytics right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsRequestBody;

    if (shouldIgnorePath(body.path)) {
      return Response.json({ ok: true });
    }

    if (body.type === "page_view") {
      await recordSitePageView(body.occurredAt);
      return Response.json({ ok: true });
    }

    if (body.type === "time_on_page") {
      if (typeof body.seconds !== "number" || !Number.isFinite(body.seconds)) {
        return Response.json(
          { error: "A valid reading time is required." },
          { status: 400 },
        );
      }

      await recordSiteReadingTime(body.seconds, body.occurredAt);
      return Response.json({ ok: true });
    }

    return Response.json(
      { error: "Unsupported analytics event." },
      { status: 400 },
    );
  } catch (error) {
    console.error("Site analytics write error", error);

    return Response.json(
      { error: "Unable to record analytics right now." },
      { status: 500 },
    );
  }
}
