import Image from "next/image";
import { COMPANIES } from "@/lib/site";

export default function LogoMarquee() {
  const chips = [...COMPANIES, ...COMPANIES]; // duplicate for seamless loop

  return (
    <section
      className="border-b border-line bg-white py-13"
      aria-label="Clients we have worked with"
    >
      <p className="mb-7 text-center text-[13px] font-bold uppercase tracking-[0.12em] text-ink-soft">
        Trusted by teams at leading organizations
      </p>
      <div className="marquee">
        <div className="marquee-track">
          {chips.map(([name, slug], i) => (
            <div
              key={`${slug}-${i}`}
              className="flex h-[78px] flex-shrink-0 items-center justify-center rounded-xl border border-line bg-white px-6"
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
