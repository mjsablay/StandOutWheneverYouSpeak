"use client";

import { Eye, X } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { useViewAs, VIEW_OPTIONS } from "@/lib/view-as";

/**
 * Slim exit banner, shown ONLY while a preview is active.
 *
 * The control for starting a preview lives in the admin console — an admin
 * browsing normally shouldn't have a floating toolbar following them around.
 */
export default function ViewAsBar() {
  const { isAdmin, loading } = useAuth();
  const { viewAs, setViewAs } = useViewAs();

  if (loading || !isAdmin || viewAs === "actual") return null;

  const label =
    VIEW_OPTIONS.find((o) => o.value === viewAs)?.label ?? "someone else";

  return (
    <div className="sticky bottom-0 z-[60] border-t border-brand-dark bg-brand text-white">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-3 px-6 py-2.5">
        <Eye className="h-4 w-4 flex-shrink-0" strokeWidth={2.25} />
        <span className="text-[14px]">
          Previewing as <strong className="font-semibold">{label}</strong>
        </span>
        <button
          onClick={() => setViewAs("actual")}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:bg-white/25"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          Exit preview
        </button>
      </div>
    </div>
  );
}
