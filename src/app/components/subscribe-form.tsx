"use client";

import { FormEvent, useState } from "react";
import { isValidEmail } from "@/lib/utils";

type Props = {
  compact?: boolean;
  placeholder?: string;
  buttonLabel?: string;
  idleMessage?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
};

type Status = {
  tone: "idle" | "success" | "error";
  message: string;
};

const idleState: Status = {
  tone: "idle",
  message: "",
};

export function SubscribeForm({
  compact = false,
  placeholder = "Enter your email",
  buttonLabel = "Subscribe",
  idleMessage = "One email when a new article is published. No spam.",
  className = "",
  inputClassName = "",
  buttonClassName = "",
}: Props) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(idleState);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(idleState);

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setStatus({
        tone: "error",
        message: "Please enter a valid email.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: data.error ?? "Subscription failed. Please try again.",
        });
        return;
      }

      setEmail("");
      setStatus({
        tone: "success",
        message: data.message ?? "You are subscribed.",
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Something went wrong while saving your email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`space-y-4 ${compact ? "" : "rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-soft)]"} ${className}`}
    >
      <div className={compact ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3"}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);

            if (status.tone === "error") {
              setStatus(idleState);
            }
          }}
          placeholder={placeholder}
          aria-invalid={status.tone === "error"}
          className={`h-14 w-full rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] ${inputClassName}`}
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex h-14 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-dark)] disabled:cursor-not-allowed disabled:opacity-70 ${buttonClassName} cursor-pointer`}
        >
          {isSubmitting ? "Subscribing..." : buttonLabel}
        </button>
      </div>

      <p
        className={`text-sm ${
          status.tone === "error"
            ? "text-[var(--error-text)]"
            : status.tone === "success"
              ? "text-[var(--success-text)]"
              : "text-[var(--muted)]"
        }`}
      >
        {status.message || idleMessage}
      </p>
    </form>
  );
}
