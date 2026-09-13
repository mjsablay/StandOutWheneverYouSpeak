import type { Metadata } from "next";
import { Wrap, Section } from "@/components/ui";
import WaitlistGate from "@/components/WaitlistGate";
import TopicsBrowser from "./TopicsBrowser";

export const metadata: Metadata = {
  title: "Practice topics — Stand Out Whenever You Speak",
  description:
    "Eighty Speakers' Circle topics, each with four prompts. Choose one, frame it, make your notes, practise, and bring it to Katya.",
};

export default function TopicsPage() {
  return (
    <Section>
      <Wrap>
        <WaitlistGate>
          <TopicsBrowser />
        </WaitlistGate>
      </Wrap>
    </Section>
  );
}
