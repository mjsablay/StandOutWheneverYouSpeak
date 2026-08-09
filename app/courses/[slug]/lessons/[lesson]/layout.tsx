import type { ReactNode } from "react";
import WaitlistGate from "@/components/WaitlistGate";
import LessonShell from "./LessonShell";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <WaitlistGate>
      <LessonShell>{children}</LessonShell>
    </WaitlistGate>
  );
}
