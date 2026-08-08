import type { Metadata } from "next";
import { Wrap, Section } from "@/components/ui";
import CommunityGate from "./CommunityGate";

export const metadata: Metadata = {
  title: "Community — Stand Out Whenever You Speak",
  description:
    "Speakers' Circle members find practice partners, post recordings for feedback, and join cohort classes.",
};

export default function CommunityPage() {
  return (
    <Section>
      <Wrap>
        <CommunityGate />
      </Wrap>
    </Section>
  );
}
