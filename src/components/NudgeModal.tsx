"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { postJSON } from "@/lib/api";
import { useToast } from "./Toast";

const NUDGE_MESSAGES = [
  "Drink water!",
  "Don't break the streak!",
  "Log your meal!",
  "Eat a fruit!",
  "Go for the challenge!",
  "Hi, checking in!",
];

export function NudgeModal({
  username,
  displayName,
  onClose,
}: {
  username: string;
  displayName?: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  const send = async (message: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await postJSON("/api/friends/nudge", { username, message });
      toast(`Nudge sent to ${displayName || username}`, "success");
      onClose();
    } catch (e: any) {
      toast(e.message || "Could not send nudge", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center"
      onClick={onClose}
    >
      <div className="w-full max-w-[480px] mx-auto pointer-events-auto">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-curd rounded-t-3xl p-6 pb-8"
          style={{ animation: "ee-slide-up 0.25s ease-out" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-xl font-bold">Send a nudge</div>
            <button onClick={onClose} aria-label="Close">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {NUDGE_MESSAGES.map((m) => (
              <button
                key={m}
                disabled={busy}
                onClick={() => send(m)}
                className="w-full text-left px-4 py-3 rounded-2xl border-2 border-charcoal/10 bg-white hover:border-charcoal/30 active:scale-[0.99] transition font-medium disabled:opacity-50"
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes ee-slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
