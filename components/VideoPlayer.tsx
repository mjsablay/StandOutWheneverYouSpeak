"use client";

type Props = {
  src: string | null;
  title: string;
};

export default function VideoPlayer({ src, title }: Props) {
  if (!src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-line bg-paper-warm text-center">
        <div className="mb-3 text-4xl">🎬</div>
        <p className="text-[15px] font-semibold">Video coming soon</p>
        <p className="mt-1 max-w-[320px] text-[13.5px] text-ink-soft">
          The lesson notes and exercise below are available while this
          recording is in production.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-black">
      <video
        key={src}
        controls
        controlsList="nodownload"
        preload="metadata"
        playsInline
        className="aspect-video w-full"
        title={title}
      >
        <source src={src} type="video/mp4" />
        Your browser doesn&apos;t support embedded video.{" "}
        <a href={src} className="underline">
          Download the lesson instead.
        </a>
      </video>
    </div>
  );
}
