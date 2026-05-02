"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Sparkles, Flame, Trophy, Target, Calendar } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { NudgeModal } from "@/components/NudgeModal";
import { useFriendProfile } from "@/lib/api";
import { avatarStateLabel } from "@/lib/scoring";
import { formatRelativeTime } from "@/lib/friend-insights";
import type { Meal } from "@/lib/types";

export default function FriendProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  return (
    <AppShell>
      <ProfileInner username={username} />
    </AppShell>
  );
}

function ProfileInner({ username }: { username: string }) {
  const router = useRouter();
  const { data, error, isLoading } = useFriendProfile(username);
  const [nudgeOpen, setNudgeOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="px-5 pt-8 pb-4">
        <button onClick={() => router.back()} className="text-soft text-sm flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-soft text-sm">Loading profile…</div>
      </div>
    );
  }

  if (error || !data) {
    const status = (error as any)?.status;
    return (
      <div className="px-5 pt-8 pb-4">
        <button onClick={() => router.back()} className="text-soft text-sm flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="ee-card p-6 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="font-bold mb-1">
            {status === 403 ? "You're not friends with this person" : "Couldn't load profile"}
          </div>
          <div className="text-sm text-soft mb-4">
            {status === 403
              ? "Add them first to see their progress."
              : "Try again in a bit."}
          </div>
          <button onClick={() => router.replace("/friends")} className="ee-btn-mango">
            Go to friends
          </button>
        </div>
      </div>
    );
  }

  const p = data.profile;

  return (
    <div className="px-5 pt-8 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-charcoal/5 flex items-center justify-center"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="text-sm font-semibold">@{p.username}</div>
        <button
          onClick={() => setNudgeOpen(true)}
          className="w-9 h-9 rounded-full bg-mango/20 flex items-center justify-center text-mango-dark"
          aria-label="Nudge"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Hero */}
      <div className="ee-card p-6 text-center mb-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(245,180,0,0.4), transparent 60%)",
          }}
        />
        <div className="relative">
          <Avatar state={p.avatarState} level={p.avatarLevel} accessories={p.unlockedAccessories} size={180} />
          <div className="ee-pill mt-2">{avatarStateLabel(p.avatarState)}</div>
          <div className="font-display text-2xl font-bold mt-1">{p.displayName}</div>
          <div className="font-display text-3xl font-bold mt-3">
            {p.todayScore}<span className="text-soft text-base font-normal">/100</span>
          </div>
          <div className="text-xs text-soft">today's energy</div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm">
            <Flame size={16} className="text-tomato" />
            <span className="font-semibold">{p.streak}</span>
            <span className="text-soft">day streak</span>
          </div>
        </div>
      </div>

      {/* Recap */}
      <div className="ee-card p-5 mb-4 bg-mango/10 border border-mango/30">
        <div className="flex items-center gap-2 mb-2 text-mango-dark">
          <Sparkles size={16} />
          <div className="text-xs uppercase font-semibold tracking-wider">Weekly recap</div>
        </div>
        <div className="text-sm leading-relaxed">{p.recap}</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard icon={Flame} label="Streak" value={`${p.streak}d`} sub={`Longest ${p.longestStreak}d`} />
        <StatCard icon={Calendar} label="Days this week" value={`${p.weekStats.daysLogged}/7`} sub={`${p.weekStats.mealsLogged} meals`} />
        <StatCard icon={Target} label="Challenges" value={`${p.weekStats.challengesDone}`} sub="this week" />
        <StatCard icon={Trophy} label="Coins" value={`${p.coins}`} sub={`Level ${p.avatarLevel}`} />
      </div>

      {/* Today's meals */}
      <div className="ee-card p-5 mb-4">
        <div className="font-display text-lg font-bold mb-3">Today's meals</div>
        {p.todayMeals.length === 0 ? (
          <div className="text-sm text-soft py-2 text-center">
            Hasn't logged anything today yet.
          </div>
        ) : (
          <div className="space-y-2">
            {p.todayMeals.map((m) => (
              <MealRow key={m.id} meal={m} />
            ))}
          </div>
        )}
      </div>

      {/* Recent meals */}
      {p.recentMeals.length > 0 && (
        <div className="ee-card p-5 mb-4">
          <div className="font-display text-lg font-bold mb-3">Recent</div>
          <div className="space-y-2">
            {groupByDate(p.recentMeals).map((group) => (
              <div key={group.date}>
                <div className="text-xs text-soft uppercase tracking-wider font-semibold mb-1.5 mt-2 first:mt-0">
                  {prettyDate(group.date, p.todayDate)}
                </div>
                <div className="space-y-2">
                  {group.meals.map((m) => (
                    <MealRow key={m.id} meal={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {p.badges.length > 0 && (
        <div className="ee-card p-5">
          <div className="font-display text-lg font-bold mb-3">Badges</div>
          <div className="flex flex-wrap gap-2">
            {p.badges.map((b) => (
              <div key={b} className="ee-chip">🏅 {prettyBadge(b)}</div>
            ))}
          </div>
        </div>
      )}

      {nudgeOpen && (
        <NudgeModal
          username={p.username}
          displayName={p.displayName}
          onClose={() => setNudgeOpen(false)}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="ee-card p-4">
      <div className="flex items-center gap-1.5 mb-1.5 text-soft">
        <Icon size={14} />
        <div className="text-[11px] uppercase tracking-wider font-semibold">{label}</div>
      </div>
      <div className="font-display text-2xl font-bold">{value}</div>
      {sub && <div className="text-[11px] text-soft mt-0.5">{sub}</div>}
    </div>
  );
}

function MealRow({ meal }: { meal: Meal }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-2xl bg-curd">
      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl">
        🍽️
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{meal.foodName}</div>
        <div className="text-[11px] text-soft capitalize">
          {meal.mealType} · {meal.portion} · {formatRelativeTime(meal.timestamp)}
        </div>
      </div>
      <div className={`text-sm font-semibold ${meal.scoreChange >= 0 ? "text-leaf" : "text-tomato"}`}>
        {meal.scoreChange >= 0 ? "+" : ""}{meal.scoreChange}
      </div>
    </div>
  );
}

function groupByDate(meals: Meal[]): { date: string; meals: Meal[] }[] {
  const map = new Map<string, Meal[]>();
  for (const m of meals) {
    const arr = map.get(m.date) || [];
    arr.push(m);
    map.set(m.date, arr);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, meals]) => ({ date, meals }));
}

function prettyDate(date: string, today: string): string {
  if (date === today) return "Today";
  // date is YYYY-MM-DD
  const d = new Date(date + "T00:00:00");
  const now = new Date();
  const diff = Math.round((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function prettyBadge(id: string): string {
  if (id.startsWith("streak-")) return `${id.split("-")[1]}-day streak`;
  return id.replace(/-/g, " ");
}
