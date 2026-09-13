"use client";

import { useState } from "react";

/**
 * Lesson video.
 *
 * TWO WAYS A VIDEO CAN BE ABSENT, and they used to behave very differently:
 *
 *   1. The lesson has no recording yet (`src` is null) — an honest panel.
 *   2. The file doesn't load. In production every lesson hit this, because
 *      videoUrl() falls back to /videos/<file> when NEXT_PUBLIC_VIDEO_BASE_URL
 *      is unset, and those files are git-ignored so they exist only on a
 *      developer's Mac. The player rendered anyway and the member got a black
 *      rectangle with dead controls and no explanation.
 *
 * Both now land on the same honest panel. A missing recording should never
 * look like a broken website — the notes, exercise and quiz below still work,
 * and that is what the member should be pointed at.
 */

type Props = {
  src: string | null;
  title: string;
};

function Unavailable({ failed }: { failed: boolean }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-line bg-paper-warm px-6 text-center">
      <p className="text-[15px] font-semibold">
        {failed ? "This video isn't available right now" : "Video coming soon"}
      </p>
      <p className="mt-1 max-w-[380px] text-[13.5px] text-ink-soft">
        {failed
          ? "We're sorry — the recording didn't load. The lesson notes, exercise and quiz below all work, so carry on with those and try the video again later."
          : "The lesson notes and exercise below are available while this recording is in production."}
      </p>
    </div>
  );
}

export default function VideoPlayer({ src, title }: Props) {
  // Remember WHICH source failed rather than that one did. Navigating to
  // another lesson then clears itself, with no effect syncing state — the
  // pattern react-hooks/set-state-in-effect exists to prevent.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src) return <Unavailable failed={false} />;
  if (failedSrc === src) return <Unavailable failed />;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-black">
      <video
        key={src}
        // Deliberately the element's own src rather than a <source> child:
        // a failing <source> fires its error on the child, where React's
        // onError on the parent never sees it, which is why the old broken
        // state went unnoticed.
        src={src}
        onError={() => setFailedSrc(src)}
        controls
        controlsList="nodownload"
        preload="metadata"
        playsInline
        className="aspect-video w-full"
        title={title}
      >
        Your browser doesn&apos;t support embedded video.
      </video>
    </div>
  );
}
