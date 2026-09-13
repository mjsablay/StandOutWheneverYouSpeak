import Image from "next/image";
import { COMPANIES } from "@/lib/site";

/**
 * Barry's clients, as a quiet row. The PNGs in public/logos are cut from his
 * own client-logo deck: background knocked out, trimmed, and normalised to
 * one visual weight (see the note in CLAUDE.md), so they can sit on plain
 * white at a single height without boxes around them.
 */
export default function LogoMarquee() {
  const marks = [...COMPANIES, ...COMPANIES]; // duplicate for a seamless loop

  return (
    <section className="bg-white py-12" aria-label="Organizations Barry has coached">
      <p className="mb-8 text-center text-[13.5px] font-medium text-ink-soft">
        Barry&apos;s coaching clients have included
      </p>
      <div className="marquee">
        <div className="marquee-track items-center">
          {marks.map(([name, slug], i) => (
            <Image
              key={`${slug}-${i}`}
              src={`/logos/${slug}.png`}
              alt={name}
              width={240}
              height={64}
              className="h-[56px] w-auto flex-shrink-0 px-8"
              unoptimized
            />
          ))}
        </div>
      </div>
    </section>
  );
}
