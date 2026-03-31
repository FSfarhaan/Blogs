import sgMail from "@sendgrid/mail";
import { getRequiredEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

type PublishedPostEmail = {
  title: string;
  description: string;
  slug: string;
};

function getPreviewText(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "A fresh article just went live...";
  }

  if (normalized.endsWith("...")) {
    return normalized;
  }

  if (normalized.length <= 180) {
    return `${normalized}...`;
  }

  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function getSendGridClient() {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured.");
  }

  sgMail.setApiKey(apiKey);

  return sgMail;
}

function getFromAddress() {
  return getRequiredEnv("SENDGRID_FROM_EMAIL");
}

function buildPostUrl(slug: string) {
  return new URL(`/blog/${slug}`, `${siteConfig.url}/`).toString();
}

function buildPostEmailHtml(post: PublishedPostEmail) {
  const postUrl = buildPostUrl(post.slug);
  const previewText = getPreviewText(post.description);

  return `
    <div style="font-family: Arial, sans-serif; background:#f6efe8; padding:32px;">
      <div style="max-width:600px; margin:0 auto; background:#fffdf9; border-radius:24px; padding:32px; border:1px solid #eadfd1;">
        <p style="margin:0 0 12px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8b6f53;">
          ${siteConfig.shortName}
        </p>
        <p style="margin:0 0 10px; font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#eb6f3d;">
          New post has arrived
        </p>
        <h1 style="margin:0 0 16px; font-size:30px; line-height:1.2; color:#1d1a17;">
          ${post.title}
        </h1>
        <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#55483b;">
          ${previewText}
        </p>
        <a
          href="${postUrl}"
          style="display:inline-block; padding:12px 20px; border-radius:999px; background:#eb6f3d; color:#fff; text-decoration:none; font-weight:700;"
        >
          Read the full blog from here
        </a>
        <p style="margin:24px 0 0; font-size:13px; line-height:1.6; color:#7b6c5d;">
          You are receiving this because you subscribed to updates from ${siteConfig.name}.
        </p>
      </div>
    </div>
  `;
}

export async function sendPublishedPostEmail(options: {
  recipients: string[];
  post: PublishedPostEmail;
}) {
  const { recipients, post } = options;
  const uniqueRecipients = [...new Set(recipients.map((email) => email.trim().toLowerCase()))];

  if (!uniqueRecipients.length) {
    return { sent: 0 };
  }

  const sendGrid = getSendGridClient();
  const subject = `New post: ${post.title}`;
  const html = buildPostEmailHtml(post);

  await sendGrid.send(
    uniqueRecipients.map((recipient) => ({
      to: recipient,
      from: getFromAddress(),
      subject,
      text: getPreviewText(post.description),
      html,
    })),
    false,
  );

  return { sent: uniqueRecipients.length };
}

export async function sendAdminOtpEmail(options: {
  email: string;
  otp: string;
}) {
  const sendGrid = getSendGridClient();
  const { email, otp } = options;

  await sendGrid.send({
    from: getFromAddress(),
    to: email,
    subject: "Your admin login code",
    text: `Your admin OTP is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f6efe8; padding:32px;">
        <div style="max-width:560px; margin:0 auto; background:#fffdf9; border-radius:24px; padding:32px; border:1px solid #eadfd1;">
          <p style="margin:0 0 12px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#8b6f53;">
            ${siteConfig.shortName}
          </p>
          <h1 style="margin:0 0 12px; font-size:28px; line-height:1.2; color:#1d1a17;">
            Your admin OTP
          </h1>
          <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#55483b;">
            Use the code below to sign in to your admin dashboard. This code expires in 10 minutes.
          </p>
          <div style="display:inline-block; padding:14px 18px; border-radius:18px; background:#181412; color:#fff; font-size:28px; font-weight:700; letter-spacing:0.28em;">
            ${otp}
          </div>
        </div>
      </div>
    `,
  });
}
