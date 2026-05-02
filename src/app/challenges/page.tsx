"use client";

import { Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMe, postJSON, refreshAll } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { dailyChallengeFor, WEEKLY_CHALLENGES } from "@/lib/challenges";

export default function ChallengesPage() {
  return (
    <AppShell>
      <ChallengesInner />
    </AppShell>
  );
}

function ChallengesInner() {
  const { data } = useMe();
  const { toast } = useToast();
  if (!data) return null;
  const u = data.user;
  const today = dailyChallengeFor(u.username, u.todayDate);

  const completeToday = async () => {
    try {
      await postJSON("/api/challenges/complete", { challengeId: today.id });
      toast(`+${today.rewardCoins} coins`, "success");
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const recent = u.challengeHistory.slice(0, 7);

  return (
    <div className="px-5 pt-8 pb-4">
      <h1 className="font-display text-2xl font-bold mb-1">Challenges</h1>
      <div className="text-soft text-sm mb-5">Tiny wins, every day.</div>

      {/* Today */}
      <div className="ee-card p-6 mb-4 bg-mango/10 border-2 border-mango/30">
        <div className="flex items-center justify-between mb-2">
          <div className="ee-pill !bg-mango !text-charcoal">Today</div>
          <div className="text-mango-dark font-semibold text-sm">+{today.rewardCoins} 🪙</div>
        </div>
        <div className="text-3xl mb-1">{today.emoji}</div>
        <div className="font-display text-xl font-bold">{today.title}</div>
        <div className="text-sm text-soft mt-1">{today.description}</div>
        {today.hint && (
          <div className="text-xs text-soft mt-2 italic">💡 {today.hint}</div>
        )}
        <button
          onClick={completeToday}
          disabled={u.todayChallengeDone}
          className={`mt-4 w-full py-3 rounded-full font-semibold transition active:scale-95 ${
            u.todayChallengeDone
              ? "bg-leaf text-white"
              : "bg-charcoal text-white hover:bg-black"
          }`}
        >
          {u.todayChallengeDone ? "✓ Completed" : "I did it"}
        </button>
      </div>

      {/* Weekly */}
      <div className="font-display text-lg font-bold mb-3 mt-6">This week</div>
      <div className="space-y-3 mb-6">
        {WEEKLY_CHALLENGES.map((c) => (
          <div key={c.id} className="ee-card p-5 flex items-center gap-4">
            <div className="text-3xl">{c.emoji}</div>
            <div className="flex-1">
              <div className="font-bold">{c.title}</div>
              <div className="text-xs text-soft">{c.description}</div>
            </div>
            <div className="text-mango-dark font-semibold text-sm">+{c.rewardCoins} 🪙</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="font-display text-lg font-bold mb-3">Recently completed</div>
      {recent.length === 0 ? (
        <div className="text-sm text-soft py-2">No completions yet. Start with today's challenge above.</div>
      ) : (
        <div className="space-y-2">
          {recent.map((h, i) => (
            <div key={i} className="ee-card p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-leaf/15 flex items-center justify-center text-leaf">
                <Check size={18} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">{h.id.replace(/-/g, " ")}</div>
                <div className="text-[11px] text-soft">{new Date(h.completedAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
