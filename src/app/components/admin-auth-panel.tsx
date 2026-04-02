"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_EMAIL } from "@/lib/admin-shared";

type AuthStep = "email" | "otp";

export function AdminAuthPanel() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<AuthStep>("email");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to send the OTP.");
      }

      setStep("otp");
      setFeedback(data.message ?? "OTP sent.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send the OTP.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to verify the OTP.");
      }

      setFeedback(data.message ?? "Signed in.");
      startTransition(() => {
        router.replace("/admin");
        router.refresh();
      });
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Unable to verify the OTP.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] border border-[var(--border)] [background:var(--admin-gradient)] p-8 shadow-[var(--shadow-soft)] md:p-10">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
        Admin access
      </p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        Private dashboard sign-in
      </h1>
      <p className="mt-4 text-base leading-8 text-[var(--muted)]">
        This page is reserved for one admin only. Enter your email, receive a one-time
        code, and we’ll keep you signed in for a while after verification.
      </p>

      {step === "email" ? (
        <form onSubmit={requestOtp} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-4 py-3 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              placeholder={"Enter your email"}
              autoComplete="email"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyOtp} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
              One-time password
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-input)] px-4 py-3 text-base tracking-[0.28em] text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setFeedback(null);
              }}
              className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-input)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              Change email
            </button>
          </div>
        </form>
      )}

      {feedback ? (
        <p className="mt-5 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--foreground)]">
          {feedback}
        </p>
      ) : null}

      {error ? (
        <p className="mt-5 rounded-2xl border border-[var(--error-border)] bg-[var(--error-bg)] px-4 py-3 text-sm font-medium text-[var(--error-text)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
