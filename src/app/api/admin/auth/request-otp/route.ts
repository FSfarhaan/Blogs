import { isValidEmail } from "@/lib/utils";
import { ADMIN_EMAIL } from "@/lib/admin-shared";
import {
  createAndStoreAdminOtp,
  isAllowedAdminEmail,
} from "@/lib/admin-auth";
import { sendAdminOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    if (!isAllowedAdminEmail(email)) {
      return Response.json(
        { error: `Only ${ADMIN_EMAIL} can access this admin dashboard.` },
        { status: 403 },
      );
    }

    const otp = await createAndStoreAdminOtp(email);
    await sendAdminOtpEmail({ email, otp });

    return Response.json({
      message: "An OTP has been sent to your email address.",
    });
  } catch (error) {
    console.error("Admin OTP request error", error);

    return Response.json(
      { error: "Unable to send an OTP right now." },
      { status: 500 },
    );
  }
}
