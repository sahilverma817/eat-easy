"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { postJSON } from "@/lib/api";
import { Avatar } from "@/components/Avatar";

const STEPS = [
  {
    key: "displayName",
    title: "What should we call you?",
    type: "text" as const,
    placeholder: "Ananya",
  },
  {
    key: "ageGroup",
    title: "Your age group?",
    type: "choice" as const,
    options: [
      { value: "18-24", label: "18 – 24" },
      { value: "25-30", label: "25 – 30" },
      { value: "30+", label: "30+" },
    ],
  },
  {
    key: "lifestyle",
    title: "What's your daily life like?",
    type: "choice" as const,
    options: [
      { value: "student", label: "College student" },
      { value: "working", label: "Working" },
      { value: "hostel", label: "Hostel / PG" },
      { value: "home", label: "Home" },
    ],
  },
  {
    key: "goal",
    title: "Why are you here?",
    type: "choice" as const,
    options: [
      { value: "eat-cleaner", label: "Eat cleaner" },
      { value: "lose-weight", label: "Lose weight slowly" },
      { value: "gain-energy", label: "Gain energy" },
      { value: "reduce-junk", label: "Cut down on junk" },
      { value: "build-routine", label: "Build a routine" },
    ],
  },
  {
    key: "foodPreference",
    title: "Food preference?",
    type: "choice" as const,
    options: [
      { value: "veg", label: "Vegetarian" },
      { value: "non-veg", label: "Non-vegetarian" },
      { value: "eggetarian", label: "Eggetarian" },
      { value: "jain", label: "Jain" },
    ],
  },
  {
    key: "cuisinePreference",
    title: "Usual food style?",
    type: "choice" as const,
    options: [
      { value: "north", label: "North Indian" },
      { value: "south", label: "South Indian" },
      { value: "mixed", label: "Mixed" },
      { value: "hostel", label: "Hostel / canteen" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!sessionStorage.getItem("ee_signup_username")) {
      router.replace("/auth");
    }
  }, [router]);

  const current = STEPS[step];
  const canNext =
    current.type === "text" ? !!(data[current.key] && data[current.key].trim()) : !!data[current.key];

  const next = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // Final submit
    setBusy(true);
    setError(null);
    try {
      const username = sessionStorage.getItem("ee_signup_username") || "";
      const pin = sessionStorage.getItem("ee_signup_pin") || "";
      await postJSON("/api/auth/signup", { username, pin, ...data });
      sessionStorage.removeItem("ee_signup_username");
      sessionStorage.removeItem("ee_signup_pin");
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Couldn't create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="px-6 pt-10 pb-2">
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition ${
                i <= step ? "bg-charcoal" : "bg-charcoal/10"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="px-6 pt-8 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className="text-soft text-xs uppercase tracking-wider font-semibold mb-2">
              Step {step + 1} of {STEPS.length}
            </div>
            <h1 className="font-display text-3xl font-bold mb-6">{current.title}</h1>

            {current.type === "text" && (
              <input
                autoFocus
                value={data[current.key] || ""}
                maxLength={30}
                onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
                placeholder={current.placeholder}
                className="w-full px-4 py-4 rounded-3xl bg-white border border-charcoal/10 focus:outline-none focus:border-charcoal/30 font-medium text-lg"
              />
            )}

            {current.type === "choice" && (
              <div className="space-y-3">
                {current.options!.map((opt) => {
                  const selected = data[current.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setData({ ...data, [current.key]: opt.value })}
                      className={`w-full text-left px-5 py-4 rounded-3xl border-2 transition active:scale-[0.99] font-medium ${
                        selected
                          ? "border-charcoal bg-charcoal text-white"
                          : "border-charcoal/10 bg-white text-charcoal hover:border-charcoal/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {step === STEPS.length - 1 && (
              <div className="mt-8 ee-card p-5 flex items-center gap-4">
                <Avatar state="active" level={1} size={80} />
                <div>
                  <div className="font-semibold">Your avatar</div>
                  <div className="text-xs text-soft">Will grow with your meals</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && <div className="text-tomato text-sm mt-4">{error}</div>}
      </div>

      <div className="px-6 pb-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="ee-btn-outline"
            disabled={busy}
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext || busy}
          className="ee-btn-mango flex-1 disabled:opacity-40"
        >
          {busy ? "…" : step < STEPS.length - 1 ? "Next" : "Start eating easy"}
        </button>
      </div>
    </div>
  );
}
