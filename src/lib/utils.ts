export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const tagTones = [
  {
    backgroundColor: "rgba(239, 109, 67, 0.16)",
    borderColor: "rgba(239, 109, 67, 0.3)",
    color: "#d96c46",
  },
  {
    backgroundColor: "rgba(107, 91, 210, 0.16)",
    borderColor: "rgba(107, 91, 210, 0.3)",
    color: "#7d69f2",
  },
  {
    backgroundColor: "rgba(78, 176, 127, 0.16)",
    borderColor: "rgba(78, 176, 127, 0.3)",
    color: "#49a66f",
  },
  {
    backgroundColor: "rgba(91, 166, 255, 0.16)",
    borderColor: "rgba(91, 166, 255, 0.3)",
    color: "#4f97f0",
  },
  {
    backgroundColor: "rgba(255, 181, 71, 0.18)",
    borderColor: "rgba(255, 181, 71, 0.34)",
    color: "#db8d1f",
  },
  {
    backgroundColor: "rgba(237, 101, 170, 0.16)",
    borderColor: "rgba(237, 101, 170, 0.28)",
    color: "#d55897",
  },
];

export function getTagTone(tag: string, index = 0) {
  const normalizedTag = tag.trim().toLowerCase();
  const hash = normalizedTag.split("").reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return tagTones[(hash + index) % tagTones.length];
}

export function absoluteUrl(path = "") {
  return new URL(path, `${siteOrigin()}/`).toString();
}

export function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
