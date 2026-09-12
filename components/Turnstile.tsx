"use client";

/**
 * Cloudflare Turnstile — the gate on the email signup form.
 *
 * WHY: the email form used to accept anything typed into it and immediately
 * created an account, so a script could add addresses to the waitlist all day.
 * 189 of them arrived that way. OAuth can't be scripted like that; the email
 * path needs a challenge of its own.
 *
 * INERT UNTIL CONFIGURED. With no NEXT_PUBLIC_TURNSTILE_SITE_KEY this renders
 * nothing and reports a null token, and Supabase accepts the request as before
 * — so the site keeps working while the key is being set up. Turning it on
 * takes two steps, both outside this repo:
 *   1. Cloudflare → Turnstile → add a site → copy the site key and secret
 *   2. Supabase → Authentication → Attack Protection → CAPTCHA → paste secret
 * Then set NEXT_PUBLIC_TURNSTILE_SITE_KEY in .env.local and in Vercel.
 */

import { useEffect, useRef, useState } from "react";

export const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

/** True when a challenge is configured and therefore required. */
export const captchaEnabled = () => TURNSTILE_SITE_KEY.length > 0;

type TurnstileApi = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      theme?: "light" | "dark" | "auto";
    },
  ) => string;
  reset: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function Turnstile({
  onToken,
}: {
  onToken: (token: string | null) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!captchaEnabled() || !box.current) return;

    let cancelled = false;

    const draw = () => {
      if (cancelled || !box.current || !window.turnstile || widget.current)
        return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => {
          onToken(null);
          setFailed(true);
        },
      });
    };

    if (window.turnstile) {
      draw();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", draw);
    script.addEventListener("error", () => setFailed(true));

    return () => {
      cancelled = true;
      script.removeEventListener("load", draw);
    };
  }, [onToken]);

  if (!captchaEnabled()) return null;

  return (
    <div className="mb-5">
      <div ref={box} />
      {failed && (
        <p className="mt-2 text-[13px] text-ink-soft">
          The verification check couldn&apos;t load. Refresh the page, or use
          one of the sign-in buttons above.
        </p>
      )}
    </div>
  );
}
