import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WaitlistGate from "@/components/WaitlistGate";
import { findTopic, sectionOf } from "@/lib/topics";
import TopicWorkspace from "./TopicWorkspace";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const topic = findTopic(id);
  return {
    title: topic
      ? `${topic.title} — Speakers' Circle`
      : "Topic not found — Stand Out Whenever You Speak",
  };
}

export default async function TopicPage({ params }: { params: Params }) {
  const { id } = await params;
  const topic = findTopic(id);
  if (!topic) notFound();
  return (
    <WaitlistGate>
      <TopicWorkspace topic={topic} sectionName={sectionOf(id)?.name ?? null} />
    </WaitlistGate>
  );
}
