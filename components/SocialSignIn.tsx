"use client";

import { useState } from "react";
import { useAuth, type OAuthProvider } from "@/lib/mock-auth";

/**
 * Social sign-in buttons.
 *
 * Each provider must be enabled in the Supabase dashboard first
 * (Authentication → Providers) with a client ID and secret from that
 * provider's developer console. Until then the button returns an error.
 *
 * "azure" is Microsoft — it covers Outlook, Hotmail, and work accounts.
 */

const PROVIDERS: {
  id: OAuthProvider;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "google",
    label: "Continue with Google",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8h-4v3.1A12 12 0 0 0 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.3 14.3a7.1 7.1 0 0 1 0-4.6v-3.1h-4a12 12 0 0 0 0 10.8l4-3.1z"
        />
        <path
          fill="#EA4335"
          d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"
        />
      </svg>
    ),
  },
  {
    id: "azure",
    label: "Continue with Microsoft",
    icon: (
      <svg viewBox="0 0 23 23" className="h-5 w-5" aria-hidden>
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M12 1h10v10H12z" />
        <path fill="#00A4EF" d="M1 12h10v10H1z" />
        <path fill="#FFB900" d="M12 12h10v10H12z" />
      </svg>
    ),
  },
  {
    id: "linkedin_oidc",
    label: "Continue with LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="#0A66C2"
          d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5V9h3v10zM6.5 7.7a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6zM19 19h-3v-5.4c0-1.3-.5-2.2-1.7-2.2-.9 0-1.4.6-1.7 1.2-.1.2-.1.5-.1.8V19h-3V9h3v1.3a3 3 0 0 1 2.7-1.5c2 0 3.5 1.3 3.5 4.1V19z"
        />
      </svg>
    ),
  },
];

export default function SocialSignIn({ next }: { next?: string }) {
  const { signInWithProvider } = useAuth();
  const [busy, setBusy] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[13px] font-semibold text-ink-soft">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="space-y-2.5">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy !== null}
            onClick={async () => {
              setBusy(p.id);
              setError(null);
              const res = await signInWithProvider(p.id, next);
              if (res.error) {
                setError(res.error);
                setBusy(null);
              }
              // On success the browser redirects, so no state reset needed.
            }}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 py-3 text-[15px] font-semibold transition hover:bg-paper-warm disabled:opacity-60"
          >
            {p.icon}
            {busy === p.id ? "Redirecting…" : p.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-[14px] font-medium text-brand">
          {error.toLowerCase().includes("not enabled")
            ? "That sign-in option isn't switched on yet — use your email for now."
            : error}
        </p>
      )}
    </div>
  );
}
