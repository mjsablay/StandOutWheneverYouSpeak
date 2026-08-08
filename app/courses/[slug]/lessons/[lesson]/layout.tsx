import type { ReactNode } from "react";
import LessonShell from "./LessonShell";

export default function LessonLayout({ children }: { children: ReactNode }) {
  return <LessonShell>{children}</LessonShell>;
}
