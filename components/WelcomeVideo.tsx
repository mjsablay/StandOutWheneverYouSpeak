"use client";

/** Set only when Barry supplies the actual welcome recording. */
export const WELCOME_VIDEO_URL = process.env.NEXT_PUBLIC_WELCOME_VIDEO_URL || "";

export default function WelcomeVideo() {
  if (!WELCOME_VIDEO_URL) return null;
  return <section aria-label="Welcome from Barry" className="mx-auto max-w-[880px]">
    <h2 className="display mb-4 text-2xl">Welcome to Stand Out</h2>
    <video controls playsInline preload="metadata" aria-label="Welcome from Barry Kuntz" className="aspect-video w-full rounded-3xl bg-ink" src={WELCOME_VIDEO_URL}>
      Your browser does not support this video.
    </video>
    <p className="mt-3 text-sm text-ink-soft">A welcome from Barry, and where to begin.</p>
  </section>;
}
