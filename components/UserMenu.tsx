"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, initialsOf } from "@/lib/mock-auth";
import { NOTIFICATIONS, CONVERSATIONS } from "@/lib/members";

const unreadNotifs = NOTIFICATIONS.filter((n) => n.unread).length;
const unreadMsgs = CONVERSATIONS.filter((c) => c.unread).length;

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
      {count}
    </span>
  );
}

export default function UserMenu() {
  const { user, signOut, isAdmin, hasFullAccess } = useAuth();
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

  const isMember = hasFullAccess;
  const totalUnread = unreadNotifs + unreadMsgs;

  const items = [
    { href: "/account", icon: "👤", label: "View profile" },
    { href: "/messages", icon: "💬", label: "Messages", badge: unreadMsgs },
    {
      href: "/notifications",
      icon: "🔔",
      label: "Notifications",
      badge: unreadNotifs,
    },
    { href: "/community", icon: "👥", label: "Community" },
    { href: "/account", icon: "⚙️", label: "Settings & data" },
    ...(isAdmin
      ? [{ href: "/admin", icon: "🛡️", label: "Admin console" }]
      : []),
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        className="relative flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 transition hover:bg-paper-warm"
      >
        <span
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
            isMember ? "bg-accent text-ink" : "bg-brand text-white"
          }`}
        >
          {initialsOf(user.name || user.email)}
        </span>
        <span className="text-[9px] leading-none text-ink-soft">▼</span>
        {totalUnread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[268px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_14px_34px_rgba(20,24,31,.14)]">
          {/* Identity */}
          <div className="border-b border-line p-4">
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${
                  isMember ? "bg-accent text-ink" : "bg-brand text-white"
                }`}
              >
                {initialsOf(user.name || user.email)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-bold">
                  {user.name || "Your profile"}
                </div>
                <div className="truncate text-[12.5px] text-ink-soft">
                  {user.email}
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span
                className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                  user.tier === "circle"
                    ? "bg-accent-soft text-accent-ink"
                    : "bg-brand-soft text-brand"
                }`}
              >
                {user.tier === "circle" ? "Speakers' Circle" : "Front Row"}
              </span>
              {isAdmin && (
                <span className="inline-block rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-bold text-white">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          <div className="p-2">
            {items.map((i) => (
              <Link
                key={i.label}
                href={i.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3.5 rounded-lg px-3 py-2.5 text-[14.5px] font-medium hover:bg-paper-warm"
              >
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[15px] leading-none">
                  {i.icon}
                </span>
                <span className="flex-1">{i.label}</span>
                <Badge count={i.badge ?? 0} />
              </Link>
            ))}
          </div>

          {!isMember && (
            <div className="border-t border-line p-3">
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="block rounded-lg bg-accent px-4 py-2.5 text-center text-[14px] font-semibold text-ink hover:bg-accent-dark"
              >
                Upgrade — $10 CAD/mo
              </Link>
            </div>
          )}

          <div className="border-t border-line p-2">
            <button
              onClick={async () => {
                setOpen(false);
                await signOut();
                router.push("/");
              }}
              className="flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left text-[14.5px] font-medium text-ink-soft hover:bg-paper-warm hover:text-ink"
            >
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[15px] leading-none">
                ↪
              </span>
              <span className="flex-1">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
