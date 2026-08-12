"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LogOut,
  MessageSquare,
  Bell,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth, initialsOf } from "@/lib/mock-auth";
import { useAccess } from "@/lib/access";
import { PRELAUNCH } from "@/lib/site";

export default function UserMenu({
  unreadMessages = 0,
  unreadNotifications = 0,
}: {
  unreadMessages?: number;
  unreadNotifications?: number;
}) {
  const { user, signOut } = useAuth();
  const access = useAccess();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const fullSite = !PRELAUNCH || access.admin;
  const totalUnread = unreadMessages + unreadNotifications;

  // Community lives in the main navigation — deliberately not repeated here.
  const items = [
    { href: "/account", icon: UserRound, label: "Profile", show: true },
    {
      href: "/messages",
      icon: MessageSquare,
      label: "Messages",
      badge: unreadMessages,
      show: fullSite,
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadNotifications,
      show: fullSite,
    },
    {
      href: "/admin",
      icon: ShieldCheck,
      label: "Admin console",
      show: access.admin,
    },
  ].filter((i) => i.show);

  const tierLabel = access.admin
    ? "Administrator"
    : user.tier === "circle"
      ? "Speakers' Circle"
      : user.status === "approved"
        ? "Front Row"
        : "Waitlisted";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="relative flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-2.5 transition hover:bg-paper-warm"
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt=""
            className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
            style={{ objectPosition: user.avatar_position ?? "50% 50%" }}
          />
        ) : (
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-semibold text-white">
            {initialsOf(user.name || user.email)}
          </span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-ink-soft" strokeWidth={2.5} />
        {totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[264px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_12px_32px_rgba(20,24,31,.14)]">
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-11 w-11 flex-shrink-0 rounded-full object-cover"
                  style={{ objectPosition: user.avatar_position ?? "50% 50%" }}
                />
              ) : (
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {initialsOf(user.name || user.email)}
                </span>
              )}
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold">
                  {user.name}
                </div>
                <div className="truncate text-[12.5px] text-ink-soft">
                  {tierLabel}
                </div>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            {items.map(({ href, icon: Icon, label, badge }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium hover:bg-paper-warm"
              >
                <Icon className="h-[18px] w-[18px] text-ink-soft" strokeWidth={2} />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>

          <div className="border-t border-line p-1.5">
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium text-ink-soft hover:bg-paper-warm hover:text-ink"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
