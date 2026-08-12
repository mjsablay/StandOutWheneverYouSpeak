"use client";

import { Eye } from "lucide-react";
import { useViewAs, VIEW_OPTIONS } from "@/lib/view-as";

/**
 * Starts a "view as" preview. Lives in the admin console rather than as a
 * floating bar, so normal admin browsing stays uncluttered. While a preview
 * is running, a slim banner at the bottom of the page offers a way out.
 */
export default function PreviewControl() {
  const { viewAs, setViewAs } = useViewAs();

  return (
    <div className="mb-8 rounded-2xl border border-line bg-white">
      <div className="flex items-center gap-2.5 border-b border-line bg-paper-warm px-6 py-4">
        <Eye className="h-[18px] w-[18px] text-ink-soft" strokeWidth={2} />
        <h2 className="font-semibold">Preview the site</h2>
      </div>

      <div className="p-6">
        <p className="mb-4 max-w-[560px] text-[14.5px] text-ink-soft">
          See exactly what each type of person sees. Your real permissions
          don&apos;t change — this only affects what the interface shows you.
        </p>

        <div className="flex flex-wrap gap-2.5">
          {VIEW_OPTIONS.filter((o) => o.value !== "actual").map((o) => (
            <button
              key={o.value}
              onClick={() => setViewAs(o.value)}
              className={`rounded-lg border px-4 py-2.5 text-[14px] font-semibold transition ${
                viewAs === o.value
                  ? "border-brand bg-brand text-white"
                  : "border-line hover:bg-paper-warm"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {viewAs !== "actual" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-brand-soft p-4">
            <span className="text-[14px]">
              Preview active. Browse the site, then exit from the banner at the
              bottom of the page.
            </span>
            <button
              onClick={() => setViewAs("actual")}
              className="ml-auto rounded-lg border border-line bg-white px-4 py-2 text-[13.5px] font-semibold hover:bg-paper-warm"
            >
              Exit now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
