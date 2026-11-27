import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "SAT Acers — Ace it. Every day.",
  description:
    "Free Digital SAT prep: 5 full-length mocks, 500+ questions with explanations, a Mistake Log and a daily streak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
