import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Section, Wrap, Eyebrow } from "@/components/ui";
import PreparationToolkit from "@/components/PreparationToolkit";

export const metadata: Metadata = {
  title: "Prepare your presentation — Stand Out Whenever You Speak",
  description: "Barry's original Presentation Pyramid and Masterful Notes prompts, with a step-by-step guide to using them.",
};

export default function PreparationPage() {
  return <Section><Wrap>
    <Link href="/courses" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="h-4 w-4" />Back to Leadership Voice</Link>
    <div className="mb-10 max-w-[760px]">
      <Eyebrow>Your preparation toolkit</Eyebrow>
      <h1 className="display text-[clamp(30px,4.4vw,50px)]">A clear message. Notes you can speak from.</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-soft">Use Barry&apos;s two prompts with ChatGPT or Microsoft Copilot to prepare your presentation. Start with your audience and purpose, then build the thinking before shaping the delivery.</p>
    </div>
    <PreparationToolkit />
  </Wrap></Section>;
}
