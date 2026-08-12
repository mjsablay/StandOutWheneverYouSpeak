"use client";

import Link from "next/link";
import { NAV_LINKS, PRELAUNCH_NAV_LINKS, PRELAUNCH } from "@/lib/site";
import { useAuth } from "@/lib/mock-auth";
import { useAudience } from "@/lib/view-as";

export default function Footer() {
  const { isAdmin } = useAuth();
  const { previewing } = useAudience();

  const fullSite = !PRELAUNCH || (isAdmin && !previewing);
  const links = fullSite ? NAV_LINKS : PRELAUNCH_NAV_LINKS;

  return (
    <footer className="mt-auto border-t border-line py-12 text-sm text-ink-soft">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-6">
        <div>© {new Date().getFullYear()} Stand Out Whenever You Speak</div>
        <div className="flex flex-wrap gap-6">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
