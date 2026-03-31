import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-shared";
import {
  getAdminSessionCookieOptions,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST() {
  (await cookies()).set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  });

  return Response.json({ message: "Logged out." });
}
