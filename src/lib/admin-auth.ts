import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getRequiredEnv } from "@/lib/env";
import { getAdminOtpCollection } from "@/lib/firebase";
import { ADMIN_EMAIL } from "@/lib/admin-shared";

const ADMIN_OTP_TTL_MS = 10 * 60 * 1000;
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type AdminSessionPayload = {
  email: string;
  expiresAt: number;
};

function getAdminAuthSecret() {
  return getRequiredEnv("ADMIN_AUTH_SECRET");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function signValue(value: string) {
  return createHmac("sha256", getAdminAuthSecret()).update(value).digest("base64url");
}

function hashOtp(otp: string) {
  return createHmac("sha256", getAdminAuthSecret()).update(otp).digest("hex");
}

function isSafeSignatureMatch(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);

  if (first.length !== second.length) {
    return false;
  }

  return timingSafeEqual(first, second);
}

export function isAllowedAdminEmail(email: string) {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export async function createAndStoreAdminOtp(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const otp = `${randomInt(100000, 1000000)}`;

  await getAdminOtpCollection().doc(normalizedEmail).set({
    email: normalizedEmail,
    otpHash: hashOtp(otp),
    expiresAt: Date.now() + ADMIN_OTP_TTL_MS,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return otp;
}

export async function verifyStoredAdminOtp(email: string, otp: string) {
  const normalizedEmail = normalizeEmail(email);
  const otpRef = getAdminOtpCollection().doc(normalizedEmail);
  const snapshot = await otpRef.get();

  if (!snapshot.exists) {
    return false;
  }

  const data = snapshot.data() as
    | {
        otpHash?: string;
        expiresAt?: number;
      }
    | undefined;

  if (!data?.otpHash || typeof data.expiresAt !== "number") {
    await otpRef.delete();
    return false;
  }

  if (data.expiresAt <= Date.now()) {
    await otpRef.delete();
    return false;
  }

  if (data.otpHash !== hashOtp(otp.trim())) {
    return false;
  }

  await otpRef.delete();
  return true;
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email: normalizeEmail(email),
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  return `${encodedPayload}.${signValue(encodedPayload)}`;
}

export function verifyAdminSessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = signValue(encodedPayload);

  if (!isSafeSignatureMatch(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    return (
      payload.email === ADMIN_EMAIL &&
      typeof payload.expiresAt === "number" &&
      payload.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
}
