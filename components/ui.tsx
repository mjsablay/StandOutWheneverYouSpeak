import Link from "next/link";
import type { ReactNode } from "react";
import { Check as CheckIcon } from "lucide-react";

/* ---------- Layout helpers ---------- */

export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1180px] px-6 ${className}`}>{children}</div>
  );
}

export function Section({
  children,
  alt = false,
  className = "",
}: {
  children: ReactNode;
  alt?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`py-20 sm:py-28 ${alt ? "bg-paper-soft" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

/** Small pill above a heading. Says what the section is, in two words. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-soft px-3.5 py-1.5 text-[13px] font-semibold text-brand">
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-12 max-w-[720px] ${center ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="display text-[clamp(32px,4.6vw,52px)]">{title}</h2>
      {sub && (
        <p className="mt-4 text-[18px] leading-relaxed text-ink-soft">{sub}</p>
      )}
    </div>
  );
}

/* ---------- Buttons ---------- */

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "brand" | "accent" | "white" | "ghost";
  className?: string;
  external?: boolean;
};

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

const btnVariants = {
  brand: "bg-brand text-white hover:bg-brand-dark",
  accent: "bg-accent text-ink hover:bg-accent-dark",
  white: "border border-line bg-white text-ink hover:bg-paper-soft",
  ghost: "text-ink hover:bg-paper-soft",
};

export function Btn({
  href,
  children,
  variant = "brand",
  className = "",
  external = false,
}: BtnProps) {
  const cls = `${btnBase} ${btnVariants[variant]} ${className}`;
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/* ---------- Bits ---------- */

export function Check() {
  return (
    <CheckIcon
      className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-accent"
      strokeWidth={2.5}
    />
  );
}

export function Avatar({
  initials,
  size = 34,
  variant = "brand",
  src,
  alt,
  position,
}: {
  initials: string;
  size?: number;
  variant?: "brand" | "accent" | "dark";
  /** Photo URL. Falls back to initials when absent. */
  src?: string | null;
  alt?: string;
  /** CSS object-position, e.g. "50% 30%" — lets members centre their face. */
  position?: string | null;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? "Profile photo"}
        width={size}
        height={size}
        className="flex-shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
          objectPosition: position ?? "50% 50%",
        }}
      />
    );
  }

  const bg =
    variant === "accent"
      ? "bg-accent text-ink"
      : variant === "dark"
        ? "bg-brand-dark text-white"
        : "bg-brand text-white";
  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-full font-bold ${bg}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

/**
 * Reserves vertical space while auth state resolves on the client.
 * Without this, gated pages render nothing then pop in, shifting the layout.
 */
export function PageSkeleton() {
  return (
    <Section>
      <Wrap>
        <div className="min-h-[60vh] animate-pulse">
          <div className="mb-4 h-4 w-28 rounded-full bg-paper-warm" />
          <div className="mb-3 h-10 w-2/3 max-w-[420px] rounded-xl bg-paper-warm" />
          <div className="h-4 w-full max-w-[560px] rounded-full bg-paper-warm" />
        </div>
      </Wrap>
    </Section>
  );
}

export function TierBadge({ tier }: { tier: "free" | "member" }) {
  return tier === "free" ? (
    <span className="whitespace-nowrap rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-brand">
      Free
    </span>
  ) : (
    <span className="whitespace-nowrap rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-accent-ink">
      Speakers&apos; Circle
    </span>
  );
}
