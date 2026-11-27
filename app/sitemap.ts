import type { MetadataRoute } from "next";
import { MOCKS } from "@/lib/mocks";

const BASE = "https://sat-acers.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/practice", "/mock", "/vocab", "/official", "/leaderboard", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...MOCKS.map((m) => ({ url: `${BASE}/mock/${m.id}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
