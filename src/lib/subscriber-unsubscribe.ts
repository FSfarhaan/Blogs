import { createHmac, timingSafeEqual } from "node:crypto";
import { getRequiredEnv } from "@/lib/env";

const FALLBACK_EMAIL_SITE_URL = "https://blogs.farhaanshaikh.dev";

function normalizeBaseUrl(url?: string) {
  const value = url?.trim();

  if (!value) {
    return FALLBACK_EMAIL_SITE_URL;
  }

  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function getUnsubscribeSecret() {
  return getRequiredEnv("RESEND_API_KEY");
}

export function normalizeSubscriberEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getEmailSiteOrigin() {
  const baseUrl = normalizeBaseUrl(
    process.env.EMAIL_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
  );

  return new URL(baseUrl).origin;
}

export function buildEmailSiteUrl(path = "/") {
  return new URL(path, `${getEmailSiteOrigin()}/`).toString();
}

function createUnsubscribeToken(email: string) {
  return createHmac("sha256", getUnsubscribeSecret())
    .update(normalizeSubscriberEmail(email))
    .digest("hex");
}

export function buildSubscriberUnsubscribeUrl(email: string) {
  const url = new URL("/unsubscribe", `${getEmailSiteOrigin()}/`);

  url.searchParams.set("email", normalizeSubscriberEmail(email));
  url.searchParams.set("token", createUnsubscribeToken(email));

  return url.toString();
}

export function verifySubscriberUnsubscribeToken(email: string, token: string) {
  const normalizedToken = token.trim();
  const expectedToken = createUnsubscribeToken(email);

  if (normalizedToken.length !== expectedToken.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(normalizedToken, "utf8"),
    Buffer.from(expectedToken, "utf8"),
  );
}
