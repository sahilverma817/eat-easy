"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJSON } from "@/lib/api";
import Link from "next/link";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (tab === "login") {
        await postJSON("/api/auth/login", { username, pin });
        router.replace("/dashboard");
      } else {
        // For signup, send to onboarding with the data
        sessionStorage.setItem("ee_signup_username", username.toLowerCase());
        sessionStorage.setItem("ee_signup_pin", pin);
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="px-6 pt-12 pb-6">
        <Link href="/" className="text-soft text-sm">← Home</Link>
      </div>

      <div className="px-6 flex-1">
        <h1 className="font-display text-3xl font-bold mb-1">
          {tab === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-soft mb-8">
          {tab === "login"
            ? "Pick up where you left off."
            : "Pick a username and a 4-digit PIN."}
        </p>

        <div className="ee-card p-1 inline-flex mb-6">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              tab === "login" ? "bg-charcoal text-white" : "text-charcoal/70"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`px-5 py-2 rounded-full text-sm font-semibold ${
              tab === "signup" ? "bg-charcoal text-white" : "text-charcoal/70"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-soft uppercase tracking-wider font-semibold">Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
              maxLength={15}
              minLength={3}
              required
              placeholder="ananya_k"
              className="w-full mt-1 px-4 py-3 rounded-2xl bg-white border border-charcoal/10 focus:outline-none focus:border-charcoal/30 font-medium"
            />
            <div className="text-[11px] text-soft mt-1">3-15 chars · lowercase letters, numbers, _</div>
          </div>
          <div>
            <label className="text-xs text-soft uppercase tracking-wider font-semibold">4-digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              minLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full mt-1 px-4 py-3 rounded-2xl bg-white border border-charcoal/10 focus:outline-none focus:border-charcoal/30 font-medium tracking-[0.6em]"
            />
          </div>

          {error && <div className="text-tomato text-sm">{error}</div>}

          <button
            disabled={busy}
            className="ee-btn-mango w-full disabled:opacity-50"
          >
            {busy ? "…" : tab === "login" ? "Log in" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
