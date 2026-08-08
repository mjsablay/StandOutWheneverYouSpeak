"use client";

import { useState } from "react";

const field =
  "w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14.5px] text-ink outline-none focus:border-transparent focus:ring-2 focus:ring-brand";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="max-w-[640px] rounded-2xl border border-accent bg-accent-soft p-8">
        <h3 className="mb-1 text-lg font-bold">Thanks — message received.</h3>
        <p className="text-[15px] text-ink-soft">
          We&apos;ll get back to you shortly. In the meantime, feel free to book
          a time directly on our calendars above.
        </p>
      </div>
    );
  }

  return (
    <form
      className="max-w-[640px]"
      onSubmit={(e) => {
        e.preventDefault();
        // TODO: wire to an email provider (Resend) in a later activity
        setSent(true);
      }}
    >
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="mb-3.5">
          <label htmlFor="name" className="mb-1.5 block text-[13px] font-semibold">
            Name
          </label>
          <input id="name" name="name" required className={field} placeholder="Your name" />
        </div>
        <div className="mb-3.5">
          <label htmlFor="email" className="mb-1.5 block text-[13px] font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={field}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="mb-3.5">
        <label htmlFor="who" className="mb-1.5 block text-[13px] font-semibold">
          Who would you like to reach?
        </label>
        <select id="who" name="who" className={field}>
          <option>Either of us</option>
          <option>Barry Kuntz</option>
          <option>Michael Jordan Sablay</option>
        </select>
      </div>

      <div className="mb-3.5">
        <label htmlFor="message" className="mb-1.5 block text-[13px] font-semibold">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={`${field} min-h-[120px] resize-y`}
          placeholder="How can we help?"
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand px-5 py-2.5 text-[14.5px] font-semibold text-white transition hover:bg-brand-dark"
      >
        Send message
      </button>
    </form>
  );
}
