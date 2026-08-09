import Link from "next/link";
import type { ReactNode } from "react";

/* ---------- Layout helpers ---------- */

export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1120px] px-6 ${className}`}>{children}</div>
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
      className={`py-16 sm:py-20 ${alt ? "bg-paper-warm" : ""} ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="mb-5 inline-block text-[13px] font-bold uppercase tracking-[0.12em] text-brand">
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
      className={`mb-11 max-w-[640px] ${center ? "mx-auto text-center" : ""}`}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-tight">
        {title}
      </h2>
      {sub && <p className="mt-3.5 text-[17px] text-ink-soft">{sub}</p>}
    </div>
  );
}

/* ---------- Buttons ---------- */

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "brand" | "accent" | "ghost";
  className?: string;
  external?: boolean;
};

const btnBase =
  "inline-block rounded-lg px-5 py-2.5 text-[14.5px] font-semibold transition";

const btnVariants = {
  brand: "bg-brand text-white hover:bg-brand-dark",
  accent: "bg-accent text-ink hover:bg-accent-dark",
  ghost: "text-ink-soft hover:text-ink",
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
  return <span className="font-extrabold text-accent">✓</span>;
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
          <div className="mb-4 h-4 w-28 rounded bg-paper-warm" />
          <div className="mb-3 h-10 w-2/3 max-w-[420px] rounded bg-paper-warm" />
          <div className="h-4 w-full max-w-[560px] rounded bg-paper-warm" />
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
