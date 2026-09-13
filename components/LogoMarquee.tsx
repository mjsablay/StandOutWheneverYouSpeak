import Image from "next/image";
import { COMPANIES } from "@/lib/site";

export default function LogoMarquee() {
  const chips = [...COMPANIES, ...COMPANIES]; // duplicate for seamless loop

  return (
    <section
      className="bg-white py-12"
      aria-label="Organizations Barry has coached"
    >
      <p className="mb-7 text-center text-[13.5px] font-medium text-ink-soft">
        Barry has coached leaders at these organizations, among 3,500 others.
      </p>
      <div className="marquee">
        <div className="marquee-track">
          {chips.map(([name, slug], i) => (
            <div
              key={`${slug}-${i}`}
              className="flex h-[72px] flex-shrink-0 items-center justify-center rounded-2xl bg-paper-soft px-7"
            >
              <Image
                src={`/logos/${slug}.png`}
                alt={name}
                width={150}
                height={46}
                className="h-[46px] w-auto object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
