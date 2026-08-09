"use client";

import { useAuth } from "@/lib/mock-auth";
import { useViewAs, VIEW_LABEL, type ViewAs } from "@/lib/view-as";

/** Floating control shown only to administrators. */
export default function ViewAsBar() {
  const { isAdmin } = useAuth();
  const { viewAs, setViewAs } = useViewAs();

  if (!isAdmin) return null;

  const options: ViewAs[] = ["actual", "visitor", "free", "circle"];

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2">
      <div
        className={`flex items-center gap-1 rounded-full border px-1.5 py-1.5 shadow-[0_8px_28px_rgba(20,24,31,.22)] ${
          viewAs === "actual"
            ? "border-line bg-white"
            : "border-brand bg-brand text-white"
        }`}
      >
        <span
          className={`px-2.5 text-[12px] font-bold uppercase tracking-wider ${
            viewAs === "actual" ? "text-ink-soft" : "text-white/80"
          }`}
        >
          View as
        </span>
        {options.map((o) => (
          <button
            key={o}
            onClick={() => setViewAs(o)}
            title={o === "actual" ? "Your real account" : VIEW_LABEL[o]}
            className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${
              viewAs === o
                ? viewAs === "actual"
                  ? "bg-ink text-white"
                  : "bg-white text-brand"
                : viewAs === "actual"
                  ? "text-ink-soft hover:bg-paper-warm"
                  : "text-white/80 hover:bg-white/15"
            }`}
          >
            {o === "actual"
              ? "Admin"
              : o === "visitor"
                ? "Visitor"
                : o === "free"
                  ? "Front Row"
                  : "Circle"}
          </button>
        ))}
      </div>
    </div>
  );
}
