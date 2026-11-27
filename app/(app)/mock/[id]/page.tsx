import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MOCKS, MOCK_BY_ID } from "@/lib/mocks";
import { MockRunner } from "@/components/MockRunner";

export function generateStaticParams() {
  return MOCKS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${MOCK_BY_ID[id]?.title ?? "Mock"} — SAT Acers` };
}

export default async function MockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!MOCK_BY_ID[id]) notFound();
  return <MockRunner mockId={id} />;
}
