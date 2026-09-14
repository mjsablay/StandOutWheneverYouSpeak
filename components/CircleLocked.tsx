"use client";

import { Lock } from "lucide-react";
import { Btn, Check } from "@/components/ui";

/**
 * The card a Front Row member (or a signed-out preview) sees in place of
 * Speakers' Circle content. Same shape everywhere so the offer reads the
 * same on the topics page, in a topic workspace and on a lesson's Katya tab.
 */
export default function CircleLocked({
  signedIn,
  title,
  body,
  bullets,
}: {
  signedIn: boolean;
  title: string;
  body: string;
  bullets: readonly string[];
}) {
  return (
    <div className="rounded-3xl bg-brand px-6 py-14 text-white sm:px-12">
      <div className="mx-auto max-w-[620px]">
        <span className="mb-5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-accent">
          <Lock className="h-3.5 w-3.5" strokeWidth={2.5} />
          Speakers&apos; Circle
        </span>
        <h1 className="mb-4 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
          {title}
        </h1>
        <p className="mb-7 text-[17px] text-white/85">{body}</p>
        <ul className="mb-8 space-y-2 text-[15px] text-white/90">
          {bullets.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check /> {f}
            </li>
          ))}
        </ul>
        <Btn href={signedIn ? "/pricing" : "/request"} variant="accent">
          {signedIn ? "See Speakers' Circle" : "Request a place"}
        </Btn>
      </div>
    </div>
  );
}
