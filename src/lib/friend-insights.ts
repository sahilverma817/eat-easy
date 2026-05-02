import type { FeedActor, FeedEvent, User, WeekStats } from "./types";
import { getChallenge } from "./challenges";

function lastSevenISODates(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    out.push(`${y}-${m}-${day}`);
  }
  return out;
}

export function computeWeekStats(friend: User): WeekStats {
  const dates = new Set(lastSevenISODates());
  const weekMeals = friend.meals.filter((m) => dates.has(m.date));
  const daysLogged = new Set(weekMeals.map((m) => m.date)).size;
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const challengesDone = friend.challengeHistory.filter((c) => {
    const t = new Date(c.completedAt).getTime();
    return !Number.isNaN(t) && t >= sevenDaysAgo;
  }).length;

  return {
    daysLogged,
    mealsLogged: weekMeals.length,
    challengesDone,
  };
}

function actorOf(friend: User): FeedActor {
  return {
    username: friend.username,
    displayName: friend.displayName,
    avatarLevel: friend.avatarLevel,
    unlockedAccessories: friend.unlockedAccessories,
  };
}

export function buildEventsForFriend(friend: User): FeedEvent[] {
  const from = actorOf(friend);
  const out: FeedEvent[] = [];

  for (const m of friend.meals.slice(0, 6)) {
    out.push({
      type: "meal",
      from,
      timestamp: m.timestamp,
      meal: {
        foodName: m.foodName,
        mealType: m.mealType,
        scoreChange: m.scoreChange,
      },
    });
  }

  for (const c of friend.challengeHistory.slice(0, 4)) {
    out.push({
      type: "challenge",
      from,
      timestamp: c.completedAt,
      challengeId: c.id,
    });
  }

  return out;
}

export function describeFeedEvent(ev: FeedEvent): string {
  if (ev.type === "meal") {
    return `had ${ev.meal.foodName} for ${ev.meal.mealType}`;
  }
  if (ev.type === "challenge") {
    const ch = getChallenge(ev.challengeId);
    return `completed "${ch?.title ?? ev.challengeId.replace(/-/g, " ")}"`;
  }
  return `hit a ${ev.streak}-day streak`;
}

export function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;
  return `${Math.floor(day / 7)}w ago`;
}

const GOAL_LABEL: Record<string, string> = {
  "eat-cleaner": "eat cleaner",
  "lose-weight": "lose weight gradually",
  "gain-energy": "gain energy",
  "reduce-junk": "cut down on junk",
  "build-routine": "build a daily food routine",
};

export function buildRecapPrompt(friend: User): string {
  const stats = computeWeekStats(friend);
  const dates = new Set(lastSevenISODates());
  const weekMeals = friend.meals
    .filter((m) => dates.has(m.date))
    .slice(0, 14)
    .map((m) => `${m.date}: ${m.foodName} (${m.mealType})`)
    .join("; ") || "no meals logged this week";

  return `You write one-line weekly recaps for friends in the Eat Easy app.

Friend: ${friend.displayName}
Goal: ${GOAL_LABEL[friend.goal] || "eat better"}
Current streak: ${friend.streak} days (longest ever: ${friend.longestStreak})
Days logged this week: ${stats.daysLogged}/7
Meals logged this week: ${stats.mealsLogged}
Challenges completed this week: ${stats.challengesDone}
Recent meals: ${weekMeals}

Write ONE short sentence (max 14 words). Casual, warm, friendly Indian English.
Spot one specific pattern: a winning streak, a fried-snack lean, a hydration habit, a strong meal repeat, or a slow week.
Use the friend's first name. No emojis. No medical claims. No calorie talk.`;
}

export function staticRecapFallback(friend: User): string {
  const stats = computeWeekStats(friend);
  const first = friend.displayName.split(" ")[0];
  if (friend.streak >= 7) return `${first} is on a ${friend.streak}-day streak — strong week.`;
  if (stats.daysLogged >= 5) return `${first} logged ${stats.daysLogged} out of 7 days this week.`;
  if (stats.challengesDone >= 3) return `${first} smashed ${stats.challengesDone} challenges this week.`;
  if (stats.mealsLogged === 0) return `${first} hasn't logged anything this week — say hi.`;
  return `${first} is keeping things going — ${stats.mealsLogged} meals this week.`;
}
