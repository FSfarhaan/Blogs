import { getRequiredEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";
import {
  buildEmailSiteUrl,
  buildSubscriberUnsubscribeUrl,
} from "@/lib/subscriber-unsubscribe";

type PublishedPostEmail = {
  title: string;
  description: string;
  slug: string;
};

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type ResendResponse = {
  error?: {
    message?: string;
  };
  id?: string;
};

const creatorLinks = [
  { label: "Portfolio", href: "https://www.farhaanshaikh.dev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fsfarhaanshaikh" },
  { label: "GitHub", href: "https://github.com/FSfarhaan" },
  { label: "Instagram", href: "http://instagram.com/the_farhaanshaikh" },
  { label: "Email", href: "mailto:fsfarhaanshaikh7@gmail.com" },
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function trimWithEllipsis(content: string, maxLength = 240) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "A fresh article just went live on the blog, and I think you will enjoy this one.";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const trimmed = normalized.slice(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  const safeTrimmed = lastSpace > maxLength * 0.6 ? trimmed.slice(0, lastSpace) : trimmed;

  return `${safeTrimmed.trimEnd()}...`;
}

function getResendApiKey() {
  return getRequiredEnv("RESEND_API_KEY");
}

function getFromAddress() {
  return getRequiredEnv("RESEND_FROM_EMAIL");
}

async function sendResendEmail(payload: EmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromAddress(),
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  const data = (await response.json().catch(() => null)) as ResendResponse | null;

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      `Resend request failed with status ${response.status}.`;

    throw new Error(errorMessage);
  }

  return data;
}

function buildPrimaryButton(label: string, href: string) {
  return `
    <a
      href="${href}"
      style="display:inline-block;padding:14px 22px;border-radius:999px;background:#ef6d43;color:#fffdf9;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.01em;"
    >
      ${escapeHtml(label)}
    </a>
  `;
}

function buildSecondaryButton(label: string, href: string) {
  return `
    <a
      href="${href}"
      style="display:inline-block;padding:14px 22px;border-radius:999px;background:#fff7f0;color:#1b140f;text-decoration:none;font-size:14px;font-weight:700;border:1px solid #ead7c5;"
    >
      ${escapeHtml(label)}
    </a>
  `;
}

function buildSocialPills() {
  return creatorLinks
    .map(
      (link) => `
        <a
          href="${link.href}"
          style="display:inline-block;margin:0 8px 8px 0;padding:10px 14px;border-radius:999px;background:#fff7f0;color:#1b140f;text-decoration:none;font-size:13px;font-weight:600;border:1px solid #ead7c5;"
        >
          ${escapeHtml(link.label)}
        </a>
      `,
    )
    .join("");
}

function buildEmailShell(options: {
  eyebrow: string;
  title: string;
  intro: string;
  bodyHtml: string;
  recipientEmail?: string;
}) {
  const unsubscribeUrl = options.recipientEmail
    ? buildSubscriberUnsubscribeUrl(options.recipientEmail)
    : null;

  return `
    <div style="margin:0;padding:32px 16px;background:#f6efe8;">
      <div style="max-width:640px;margin:0 auto;background:linear-gradient(180deg,#fffdf9 0%,#fff7f0 100%);border-radius:28px;border:1px solid #eadfd1;overflow:hidden;box-shadow:0 24px 60px rgba(88,60,37,0.08);">
        <div style="padding:28px 28px 20px;background:radial-gradient(circle at top right,rgba(107,91,210,0.1),transparent 34%),radial-gradient(circle at top left,rgba(239,109,67,0.14),transparent 36%),linear-gradient(180deg,#fffdf9 0%,#fff8f2 100%);">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8b6f53;">
            ${escapeHtml(siteConfig.shortName)}
          </p>
          <p style="margin:0 0 12px;font-size:13px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#ef6d43;">
            ${escapeHtml(options.eyebrow)}
          </p>
          <h1 style="margin:0;font-size:34px;line-height:1.15;color:#1b140f;">
            ${escapeHtml(options.title)}
          </h1>
          <p style="margin:16px 0 0;font-size:16px;line-height:1.75;color:#5e4d3f;">
            ${escapeHtml(options.intro)}
          </p>
        </div>

        <div style="padding:0 28px 28px;">
          ${options.bodyHtml}

          <div style="margin-top:28px;padding-top:22px;border-top:1px solid #eadfd1;">
            <p style="margin:0 0 14px;font-size:13px;line-height:1.7;color:#6c5849;">
              Stay connected with me here:
            </p>
            <div style="margin:0 0 18px;">
              ${buildSocialPills()}
            </div>

            <p style="margin:0;font-size:12px;line-height:1.8;color:#836d5b;">
              You are receiving this because you subscribed to updates from ${escapeHtml(siteConfig.name)}.
            </p>

            ${
              unsubscribeUrl
                ? `
                  <div style="margin-top:18px;">
                    <a
                      href="${unsubscribeUrl}"
                      style="display:inline-block;padding:12px 18px;border-radius:999px;background:#1b140f;color:#fffdf9;text-decoration:none;font-size:13px;font-weight:700;"
                    >
                      Unsubscribe
                    </a>
                  </div>
                `
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildPublishedPostEmailHtml(post: PublishedPostEmail, recipientEmail: string) {
  const postUrl = buildEmailSiteUrl(`/blog/${post.slug}`);
  const browseUrl = buildEmailSiteUrl("/blogs");
  const previewText = trimWithEllipsis(post.description);

  return buildEmailShell({
    eyebrow: "New post has arrived",
    title: post.title,
    intro: previewText,
    recipientEmail,
    bodyHtml: `
      <div style="margin-top:24px;">
        ${buildPrimaryButton("Read the full article", postUrl)}
        <span style="display:inline-block;width:10px;"></span>
        ${buildSecondaryButton("Browse all blogs", browseUrl)}
      </div>
    `,
  });
}

function buildPublishedPostText(post: PublishedPostEmail, recipientEmail: string) {
  const postUrl = buildEmailSiteUrl(`/blog/${post.slug}`);
  const browseUrl = buildEmailSiteUrl("/blogs");
  const unsubscribeUrl = buildSubscriberUnsubscribeUrl(recipientEmail);
  const previewText = trimWithEllipsis(post.description);

  return [
    `${post.title}`,
    "",
    previewText,
    "",
    `Read the full article: ${postUrl}`,
    `Browse all blogs: ${browseUrl}`,
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
}

function buildWelcomeEmailHtml(recipientEmail: string) {
  const latestBlogsUrl = buildEmailSiteUrl("/blogs");
  const homeUrl = buildEmailSiteUrl("/");

  return buildEmailShell({
    eyebrow: "Welcome aboard",
    title: "You are in, and I am glad you are here.",
    intro:
      "Thanks for subscribing to my blog. I write about modern web development, AI, architecture, product thinking, and the lessons I learn while building in public.",
    recipientEmail,
    bodyHtml: `
      <div style="margin-top:24px;padding:20px;border-radius:22px;background:#fffaf4;border:1px solid #efdfd0;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:#8b6f53;">
          What to expect
        </p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:#5e4d3f;">
          You will get thoughtful posts, practical lessons, and honest takes when something new goes live. No noise, no spam, just useful writing and a real connection.
        </p>
      </div>

      <div style="margin-top:24px;">
        ${buildPrimaryButton("Read the latest blogs", latestBlogsUrl)}
        <span style="display:inline-block;width:10px;"></span>
        ${buildSecondaryButton("Visit the website", homeUrl)}
      </div>
    `,
  });
}

function buildWelcomeEmailText(recipientEmail: string) {
  const unsubscribeUrl = buildSubscriberUnsubscribeUrl(recipientEmail);
  const latestBlogsUrl = buildEmailSiteUrl("/blogs");

  return [
    `Welcome to ${siteConfig.name}!`,
    "",
    "Thanks for subscribing. I share practical writing on modern web development, AI, architecture, and lessons from building in public.",
    "",
    `Read the latest blogs: ${latestBlogsUrl}`,
    "",
    "Stay connected:",
    ...creatorLinks.map((link) => `${link.label}: ${link.href}`),
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");
}

async function sendBatchEmails(
  recipients: string[],
  buildPayload: (recipient: string) => EmailPayload,
) {
  const uniqueRecipients = [...new Set(recipients.map((email) => email.trim().toLowerCase()))];

  if (!uniqueRecipients.length) {
    return { sent: 0 };
  }

  const results = await Promise.allSettled(
    uniqueRecipients.map((recipient) => sendResendEmail(buildPayload(recipient))),
  );

  const sent = results.filter((result) => result.status === "fulfilled").length;
  const failed = results.length - sent;

  if (failed > 0) {
    console.error(`Resend failed for ${failed} email(s).`);
  }

  return { sent };
}

export async function sendPublishedPostEmail(options: {
  recipients: string[];
  post: PublishedPostEmail;
}) {
  const { recipients, post } = options;

  return sendBatchEmails(recipients, (recipient) => ({
    to: recipient,
    subject: `New post: ${post.title}`,
    text: buildPublishedPostText(post, recipient),
    html: buildPublishedPostEmailHtml(post, recipient),
  }));
}

export async function sendWelcomeSubscriberEmail(options: { email: string }) {
  const { email } = options;

  return sendResendEmail({
    to: email,
    subject: `Welcome to ${siteConfig.shortName}`,
    text: buildWelcomeEmailText(email),
    html: buildWelcomeEmailHtml(email),
  });
}

export async function sendAdminOtpEmail(options: {
  email: string;
  otp: string;
}) {
  const { email, otp } = options;

  await sendResendEmail({
    to: email,
    subject: "Your admin login code",
    text: `Your admin OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f6efe8;padding:32px;">
        <div style="max-width:560px;margin:0 auto;background:#fffdf9;border-radius:24px;padding:32px;border:1px solid #eadfd1;">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8b6f53;">
            ${escapeHtml(siteConfig.shortName)}
          </p>
          <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#1d1a17;">
            Your admin OTP
          </h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#55483b;">
            Use the code below to sign in to your admin dashboard. This code expires in 10 minutes.
          </p>
          <div style="display:inline-block;padding:14px 18px;border-radius:18px;background:#181412;color:#fff;font-size:28px;font-weight:700;letter-spacing:0.28em;">
            ${escapeHtml(otp)}
          </div>
        </div>
      </div>
    `,
  });
}
