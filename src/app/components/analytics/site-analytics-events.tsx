"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type AnalyticsPayload = {
  type: "page_view" | "time_on_page";
  path: string;
  occurredAt: string;
  seconds?: number;
};

function sendAnalytics(payload: AnalyticsPayload, preferBeacon = false) {
  const body = JSON.stringify(payload);

  if (
    preferBeacon &&
    typeof navigator !== "undefined" &&
    typeof navigator.sendBeacon === "function"
  ) {
    const beaconBody = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/site", beaconBody);
    return;
  }

  void fetch("/api/analytics/site", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: preferBeacon,
  }).catch(() => {
    return null;
  });
}

export function SiteAnalyticsEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (!pagePath || pagePath.startsWith("/admin")) {
      return;
    }

    const startedAt = Date.now();
    let didFlush = false;

    sendAnalytics({
      type: "page_view",
      path: pagePath,
      occurredAt: new Date().toISOString(),
    });

    const flushReadingTime = () => {
      if (didFlush) {
        return;
      }

      didFlush = true;

      sendAnalytics(
        {
          type: "time_on_page",
          path: pagePath,
          occurredAt: new Date().toISOString(),
          seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
        },
        true,
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushReadingTime();
      }
    };

    window.addEventListener("pagehide", flushReadingTime);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushReadingTime);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushReadingTime();
    };
  }, [pathname, searchParams]);

  return null;
}
