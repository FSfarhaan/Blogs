import { getPostByPageId } from "@/lib/blog-store";

export const runtime = "nodejs";
export const revalidate = 300;

type RouteProps = {
  params: Promise<{ pageId: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  try {
    const { pageId } = await params;
    const post = await getPostByPageId(pageId.trim());

    if (!post) {
      return Response.json({ error: "Blog post not found." }, { status: 404 });
    }

    return Response.json(
      {
        pageId: post.notionPageId,
        blocks: post.blocks,
        wordCount: post.wordCount,
        readingTime: post.readingTime,
        generatedAt: post.generatedAt,
      },
      {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
      },
    );
  } catch (error) {
    console.error("Blog content route error", error);

    return Response.json(
      { error: "Unable to load this blog post right now." },
      { status: 500 },
    );
  }
}
