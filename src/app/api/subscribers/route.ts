import { FieldValue } from "firebase-admin/firestore";
import { sendWelcomeSubscriberEmail } from "@/lib/email";
import { getSubscriberCount, getSubscribersCollection } from "@/lib/firebase";
import { isValidEmail } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const count = await getSubscriberCount();

    return Response.json({ count });
  } catch (error) {
    console.error("Subscribers fetch error", error);

    return Response.json(
      { error: "Unable to load subscribers right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const subscriberRef = getSubscribersCollection().doc(email);
    const existingSubscriber = await subscriberRef.get();

    if (existingSubscriber.exists) {
      return Response.json(
        { error: "This email is already subscribed." },
        { status: 409 },
      );
    }

    await subscriberRef.set({
      email,
      createdAt: FieldValue.serverTimestamp(),
    });

    try {
      await sendWelcomeSubscriberEmail({ email });
    } catch (error) {
      console.error("Welcome email error", error);
    }

    return Response.json({
      message: "You are subscribed and will hear about the next post.",
    });
  } catch (error) {
    console.error("Subscription error", error);

    return Response.json(
      { error: "Unable to save your subscription right now." },
      { status: 500 },
    );
  }
}
