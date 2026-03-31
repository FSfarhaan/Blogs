import { getPostBySlug } from "@/lib/blog-store";
import { sendPublishedPostEmail } from "@/lib/email";
import { getSubscriberEmails } from "@/lib/firebase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const adminSecret = process.env.POST_NOTIFICATION_SECRET;
    const requestSecret = request.headers.get("x-admin-secret");

    if (!adminSecret || requestSecret !== adminSecret) {
      return Response.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!slug) {
      return Response.json(
        { error: "A post slug is required." },
        { status: 400 },
      );
    }

    const post = await getPostBySlug(slug);

    if (!post) {
      return Response.json({ error: "Post not found." }, { status: 404 });
    }

    const recipients = await getSubscriberEmails();

    const result = await sendPublishedPostEmail({
      recipients,
      post: {
        title: post.title,
        description: post.description,
        slug: post.slug,
      },
    });

    return Response.json({
      message: "Notification batch sent.",
      recipients: recipients.length,
      delivered: result.sent,
    });
  } catch (error) {
    console.error("Post notification error", error);

    return Response.json(
      { error: "Unable to send notifications right now." },
      { status: 500 },
    );
  }
}
