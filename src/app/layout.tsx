import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./GoogleAnalytics";
import { SITE_URL } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="ar" dir="rtl">
      <head>
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
      <body className={inter.className}>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
