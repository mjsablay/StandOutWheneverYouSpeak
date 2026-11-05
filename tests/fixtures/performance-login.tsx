"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function TestLogin() {
  const [message, setMessage] = useState("");
  async function login(email: string) {
    const { error } = await createClient().auth.signInWithPassword({ email, password: "isolated-test-only" });
    setMessage(error?.message ?? "Signed in. Open the admin console or member performance page.");
  }
  return <main className="p-8 space-y-4"><h1>Isolated performance test</h1><p>No production accounts or data.</p>
    <button className="block border p-3" onClick={() => login("admin@example.invalid")}>Sign in as test administrator</button>
    <button className="block border p-3" onClick={() => login("member@example.invalid")}>Sign in as test member</button>
    <button className="block border p-3" onClick={() => login("other@example.invalid")}>Sign in as other member</button>
    <p role="status">{message}</p><a className="block underline" href="/admin?tab=performance">Open admin performance</a><a className="block underline" href="/performance">Open my performance</a>
  </main>;
}
