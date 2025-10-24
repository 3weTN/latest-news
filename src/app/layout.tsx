import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "./GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://mosaiquefm.net"),
  title: {
    default: "MosaiqueFM News - Latest Tunisian News Headlines",
    template: "%s | MosaiqueFM News",
  },
  description:
    "Stay updated with the latest Tunisian news, breaking stories, and in-depth coverage from MosaiqueFM, Tunisia's leading news source",
  keywords: [
    "Tunisia news",
    "Tunisian news",
    "MosaiqueFM",
    "breaking news",
    "أخبار تونس",
    "موزاييك",
  ],
  authors: [{ name: "MosaiqueFM" }],
  openGraph: {
    type: "website",
    locale: "ar_TN",
    alternateLocale: "fr_TN",
    siteName: "MosaiqueFM News",
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
    site: "@MosaiqueFM",
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
              name: "MosaiqueFM",
              url: "https://mosaiquefm.net",
              logo: "https://mosaiquefm.net/logo.png",
              sameAs: [
                "https://facebook.com/mosaiquefm",
                "https://twitter.com/mosaiquefm",
              ],
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
