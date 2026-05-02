"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Droplet, Plus, ChevronRight, Coins } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { ScoreRing } from "@/components/ScoreRing";
import { useFriends, useMe, postJSON, refreshAll } from "@/lib/api";
import { avatarStateFor, avatarStateLabel } from "@/lib/scoring";
import { dailyChallengeFor } from "@/lib/challenges";
import { useToast } from "@/components/Toast";

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardInner />
    </AppShell>
  );
}

function DashboardInner() {
  const router = useRouter();
  const { data, mutate } = useMe();
  const { data: friendsData } = useFriends();
  const { toast } = useToast();

  if (!data) return null;
  const u = data.user;
  const state = avatarStateFor(u.todayScore);
  const todayChallenge = dailyChallengeFor(u.username, u.todayDate);

  const addWater = async () => {
    try {
      await postJSON("/api/water", { delta: 1 });
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const completeChallenge = async () => {
    try {
      await postJSON("/api/challenges/complete", { challengeId: todayChallenge.id });
      toast(`Challenge done! +${todayChallenge.rewardCoins} coins`, "success");
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  return (
    <div className="px-5 pt-8 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-soft text-sm">{greet()}</div>
          <div className="font-display text-2xl font-bold">{u.displayName}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 ee-card px-3 py-1.5 text-sm font-semibold">
            <Coins size={14} className="text-mango-dark" /> {u.coins}
          </div>
        </div>
      </div>

      {/* Avatar + score */}
      <div className="ee-card p-5 mb-4 flex items-center gap-4">
        <Avatar state={state} level={u.avatarLevel} accessories={u.unlockedAccessories} size={120} />
        <div className="flex-1">
          <div className="ee-pill mb-1">{avatarStateLabel(state)}</div>
          <div className="font-display text-3xl font-bold">{u.todayScore}<span className="text-soft text-base font-normal">/100</span></div>
          <div className="text-xs text-soft">today's energy</div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <Flame size={16} className="text-tomato" />
            <span className="font-semibold">{u.streak}</span>
            <span className="text-soft">day streak</span>
          </div>
        </div>
      </div>

      {/* Log meal CTA */}
      <Link
        href="/log"
        className="ee-btn-mango w-full flex items-center justify-center gap-2 mb-4 py-4 text-base"
      >
        <Plus size={20} /> Log a meal
      </Link>

      {/* Water + challenge row */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={addWater}
          className="ee-card p-4 text-left active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-2 mb-2">
            <Droplet size={18} className="text-blue-500" />
            <div className="text-xs text-soft uppercase font-semibold">Water</div>
          </div>
          <div className="flex items-end gap-1 mb-1">
            <span className="font-display text-2xl font-bold">{u.waterCount}</span>
            <span className="text-soft text-sm mb-0.5">/8</span>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < u.waterCount ? "bg-blue-400" : "bg-charcoal/10"
                }`}
              />
            ))}
          </div>
          <div className="text-[11px] text-soft mt-1.5">tap to add a glass</div>
        </button>

        <Link
          href="/challenges"
          className="ee-card p-4 active:scale-[0.98] transition flex flex-col"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{todayChallenge.emoji}</span>
            <div className="text-xs text-soft uppercase font-semibold">Today's challenge</div>
          </div>
          <div className="font-semibold text-sm flex-1">{todayChallenge.title}</div>
          <div className={`text-[11px] mt-2 ${u.todayChallengeDone ? "text-leaf font-semibold" : "text-soft"}`}>
            {u.todayChallengeDone ? "✓ Completed" : `+${todayChallenge.rewardCoins} coins`}
          </div>
        </Link>
      </div>

      {/* Today's meals */}
      <div className="ee-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-lg font-bold">Today's meals</div>
          <Link href="/log" className="text-soft text-sm flex items-center">
            Add <ChevronRight size={14} />
          </Link>
        </div>
        {u.meals.filter((m) => m.date === u.todayDate).length === 0 ? (
          <div className="text-sm text-soft py-4 text-center">
            No meals logged yet. Start with breakfast.
          </div>
        ) : (
          <div className="space-y-2">
            {u.meals
              .filter((m) => m.date === u.todayDate)
              .slice(0, 5)
              .map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-2xl bg-curd">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{m.foodName}</div>
                    <div className="text-[11px] text-soft capitalize">{m.mealType} · {m.portion}</div>
                  </div>
                  <div className={`text-sm font-semibold ${m.scoreChange >= 0 ? "text-leaf" : "text-tomato"}`}>
                    {m.scoreChange >= 0 ? "+" : ""}{m.scoreChange}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Friends preview */}
      <div className="ee-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-lg font-bold">Friends</div>
          <Link href="/friends" className="text-soft text-sm flex items-center">
            All <ChevronRight size={14} />
          </Link>
        </div>
        {!friendsData?.friends?.length ? (
          <div className="text-sm text-soft py-2">
            No friends yet. Add your gang in the Friends tab.
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {friendsData.friends.slice(0, 5).map((f) => (
              <div key={f.username} className="flex flex-col items-center gap-1 min-w-[64px]">
                <Avatar state={f.avatarState} level={f.avatarLevel} accessories={f.unlockedAccessories} size={56} showAura={false} />
                <div className="text-xs font-semibold truncate max-w-[64px]">{f.displayName}</div>
                <div className="text-[10px] text-soft">{f.todayScore} · 🔥{f.streak}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.nudgeCount > 0 && (
        <div className="mt-4 ee-card p-4 bg-mango/10 border border-mango/30">
          <div className="text-sm font-semibold">💌 You have {data.nudgeCount} new nudge{data.nudgeCount > 1 ? "s" : ""}</div>
          <Link href="/friends" className="text-mango-dark text-sm font-semibold">Open friends →</Link>
        </div>
      )}
    </div>
  );
}

function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
