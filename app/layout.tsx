import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "SAT Acers — Ace it. Har kuni.",
  description:
    "Digital SAT'ga tayyorgarlik: 5 ta to'liq mock, 500+ savol, o'zbekcha tushuntirishlar, Xatonoma va kunlik streak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
