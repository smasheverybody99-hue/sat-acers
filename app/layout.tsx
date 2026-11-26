import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "SAT Acers — Ace it. Har kuni.",
  description:
    "Digital SAT'ga tayyorgarlik: question bank, o'zbekcha tushuntirishlar, Xatonoma va kunlik streak.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
