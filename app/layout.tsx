import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const TITLE = "SAT Acers — Free Digital SAT prep";
const DESCRIPTION =
  "Free Digital SAT practice: 5 adaptive full-length mocks, 750+ questions with explanations, a Mistake Log, SAT vocabulary and a daily streak.";

export const metadata: Metadata = {
  metadataBase: new URL("https://sat-acers.vercel.app"),
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  applicationName: "SAT Acers",
  keywords: ["Digital SAT", "SAT practice", "SAT mock test", "Bluebook", "SAT prep Uzbekistan", "free SAT practice test"],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SAT Acers",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
        {/* Vercel Web Analytics: cookieless page-view counts */}
        <Script id="va-init" strategy="afterInteractive">
          {`window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`}
        </Script>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
