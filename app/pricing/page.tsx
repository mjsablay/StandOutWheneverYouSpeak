import type { Metadata } from "next";
import { Wrap, Section, SectionHead } from "@/components/ui";
import PricingCards from "./PricingCards";

export const metadata: Metadata = {
  title: "Pricing — Stand Out Whenever You Speak",
  description:
    "Start free in the Front Row, or join the Speakers' Circle for $10 CAD/month. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <Section>
      <Wrap>
        <SectionHead
          eyebrow="Pricing"
          title="Take a seat. Or take the stage."
          sub="Start free in the Front Row. Step up to the Speakers' Circle when you're ready to be heard."
          center
        />
        <PricingCards />
      </Wrap>
    </Section>
  );
}
