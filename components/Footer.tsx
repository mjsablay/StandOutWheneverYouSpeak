import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line py-12 text-sm text-ink-soft">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6">
        <div>© {new Date().getFullYear()} Stand Out Whenever You Speak</div>
        <div className="flex flex-wrap gap-6">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
