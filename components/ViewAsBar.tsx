"use client";

import { Eye, X } from "lucide-react";
import { useAuth } from "@/lib/mock-auth";
import { useViewAs, VIEW_OPTIONS } from "@/lib/view-as";

/**
 * Preview switcher, shown only to real administrators.
 * Reads auth directly (not useAccess) so it never hides itself mid-preview.
 */
export default function ViewAsBar() {
  const { isAdmin, loading } = useAuth();
  const { viewAs, setViewAs } = useViewAs();

  if (loading || !isAdmin) return null;

  const previewing = viewAs !== "actual";

  return (
    <div className="fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
      <div
        className={`flex max-w-full items-center gap-1 overflow-x-auto rounded-full border p-1.5 shadow-[0_8px_28px_rgba(20,24,31,.20)] ${
          previewing ? "border-brand bg-brand" : "border-line bg-white"
        }`}
      >
        <span
          className={`flex flex-shrink-0 items-center gap-1.5 px-2.5 text-[12px] font-semibold uppercase tracking-wide ${
            previewing ? "text-white/75" : "text-ink-soft"
          }`}
        >
          <Eye className="h-3.5 w-3.5" strokeWidth={2.5} />
          View as
        </span>

        {VIEW_OPTIONS.map((o) => {
          const active = viewAs === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setViewAs(o.value)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
                active
                  ? previewing
                    ? "bg-white text-brand"
                    : "bg-ink text-white"
                  : previewing
                    ? "text-white/80 hover:bg-white/15"
                    : "text-ink-soft hover:bg-paper-warm"
              }`}
            >
              {o.label}
            </button>
          );
        })}

        {previewing && (
          <button
            onClick={() => setViewAs("actual")}
            aria-label="Exit preview"
            className="ml-1 flex-shrink-0 rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
