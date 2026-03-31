import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/admin-shared";
import {
  verifyAdminSessionToken,
} from "@/lib/admin-auth";

export async function isAdminAuthenticated() {
  const sessionToken = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(sessionToken);
}
