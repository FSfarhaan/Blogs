import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-shared";
import {
  createAdminSessionToken,
  getAdminSessionCookieOptions,
  isAllowedAdminEmail,
  verifyStoredAdminOtp,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const otp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!isAllowedAdminEmail(email)) {
      return Response.json({ error: "Unauthorized email." }, { status: 403 });
    }

    if (!otp) {
      return Response.json({ error: "Enter the OTP." }, { status: 400 });
    }

    const isValidOtp = await verifyStoredAdminOtp(email, otp);

    if (!isValidOtp) {
      return Response.json({ error: "Invalid or expired OTP." }, { status: 401 });
    }

    (await cookies()).set(
      ADMIN_SESSION_COOKIE_NAME,
      createAdminSessionToken(email),
      getAdminSessionCookieOptions(),
    );

    return Response.json({ message: "Authenticated." });
  } catch (error) {
    console.error("Admin OTP verification error", error);

    return Response.json(
      { error: "Unable to verify the OTP right now." },
      { status: 500 },
    );
  }
}
