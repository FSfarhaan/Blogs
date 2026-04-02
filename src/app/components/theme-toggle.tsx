"use client";

import { useSyncExternalStore } from "react";
import {
  defaultTheme,
  normalizeTheme,
  themeStorageKey,
  type ThemeMode,
} from "@/lib/theme";

type Props = {
  compact?: boolean;
};

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.25M12 19.25v2.25M4.75 4.75 6.35 6.35M17.65 17.65l1.6 1.6M2.5 12h2.25M19.25 12h2.25M4.75 19.25l1.6-1.6M17.65 6.35l1.6-1.6" />
    </svg>
  );
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.classList.add("theme-transition");
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;

  window.clearTimeout((window as Window & { __themeTransitionTimer?: number }).__themeTransitionTimer);
  (window as Window & { __themeTransitionTimer?: number }).__themeTransitionTimer = window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transition");
  }, 420);
}

function getDocumentTheme() {
  return normalizeTheme(document.documentElement.dataset.theme);
}

const subscribers = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  subscribers.add(onStoreChange);

  return () => {
    subscribers.delete(onStoreChange);
  };
}

function emitThemeChange() {
  subscribers.forEach((subscriber) => {
    subscriber();
  });
}

function getThemeSnapshot() {
  if (typeof document === "undefined") {
    return defaultTheme;
  }

  return getDocumentTheme();
}

export function ThemeToggle({ compact = false }: Props) {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => defaultTheme);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = `${nextTheme[0]?.toUpperCase()}${nextTheme.slice(1)} mode`;
  const ariaLabel = `Switch to ${nextTheme} theme`;

  return (
    <button
      type="button"
      aria-pressed={theme === "dark"}
      aria-label={ariaLabel}
      title={label}
      onClick={() => {
        const updatedTheme: ThemeMode = theme === "dark" ? "light" : "dark";
        applyTheme(updatedTheme);
        emitThemeChange();

        try {
          localStorage.setItem(themeStorageKey, updatedTheme);
        } catch {}
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-full cursor-pointer border border-[var(--border)] bg-[var(--surface-pill)] text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] [backdrop-filter:blur(14px)] ${
        compact ? "h-11 w-11" : "px-3 py-3"
      }`}
    >
      <span
        className={`transition duration-300 ease-out ${
          theme === "dark" ? "rotate-180 scale-90" : "rotate-0 scale-100"
        }`}
      >
        {nextTheme === "dark" ? <MoonIcon /> : <SunIcon />}
      </span>
      {/* <span className={compact ? "sr-only" : ""}>{label}</span> */}
    </button>
  );
}
