import { SITE_URL } from "@/config/site";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./GoogleAnalytics";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tunisian News - Latest Tunisian News Headlines",
    template: "%s | Tunisian News",
  },
  description:
    "Stay updated with the latest Tunisian news, breaking stories, and in-depth coverage from Tunisian News, Tunisia's leading news source",
  keywords: [
    "Tunisia news",
    "Tunisian news",
    "breaking news",
    "أخبار تونس",
    "Actualités Tunisiennes",
    "Actualités Tunisie en direct",
    "Actualités Tunisiennes en direct en ligne",
    "Actualités Tunisie en direct en ligne et en direct",
  ],
  authors: [{ name: "News Tunisia" }],
  openGraph: {
    type: "website",
    locale: "ar_TN",
    alternateLocale: "fr_TN",
    siteName: "Tunisian News",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  twitter: {
    card: "summary_large_image",
    site: "News Tunisia",
  },
  verification: {
    google: "g3oJQuqmWzE08HwnHwi8YudSH7JEmkYPg7nb8wPZFeM", // You'll need to replace this with the actual code
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://content.mosaiquefm.net" />
        <link rel="dns-prefetch" href="https://cdn.mosaiquefm.net" />
        <link rel="dns-prefetch" href="https://api.mosaiquefm.net" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link
          rel="preconnect"
          href="https://content.mosaiquefm.net"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://cdn.mosaiquefm.net"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://api.mosaiquefm.net" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://www.googletagmanager.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://www.google-analytics.com"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsMediaOrganization",
              name: "Tunisian News",
              url: `${SITE_URL}/`,
            }),
          }}
        />
      </head>
      <body className={cn("bg-background text-foreground", inter.className)}>
        <ThemeProvider>
          <GoogleAnalytics />
          <SiteHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
