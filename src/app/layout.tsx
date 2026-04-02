import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/app/components/footer";
import { Header } from "@/app/components/header";
import { GoogleAnalytics } from "@/app/components/analytics/google-analytics";
import { SiteAnalyticsEvents } from "@/app/components/analytics/site-analytics-events";
import { siteConfig } from "@/lib/site-config";
import { themeInitializerScript } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body className="min-h-full bg-[var(--page-background)] text-[var(--foreground)]">
        <GoogleAnalytics />
        <SiteAnalyticsEvents />
        <div className="relative overflow-x-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full [background:var(--shell-overlay)]" />
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
