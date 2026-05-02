import type { AvatarState, Meal, User } from "./types";
import { ADD_ONS, getFood, PORTION_MULTIPLIER } from "./foods";

export function avatarStateFor(score: number): AvatarState {
  if (score >= 81) return "glowing";
  if (score >= 61) return "active";
  if (score >= 31) return "normal";
  return "tired";
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function calcMealScoreChange(
  foodId: string,
  portion: "small" | "medium" | "large",
  addOns: string[]
): number {
  const food = getFood(foodId);
  if (!food) return 0;
  const portionMult = PORTION_MULTIPLIER[portion] ?? 1;
  const base = food.baseScore * portionMult;
  const addonDelta = addOns.reduce((sum, id) => {
    const a = ADD_ONS.find((x) => x.id === id);
    return sum + (a?.delta ?? 0);
  }, 0);
  return Math.round(base + addonDelta);
}

const BASE_SCORE = 50;

export function recomputeTodayScore(
  user: Pick<User, "todayDate" | "waterCount" | "todayChallengeDone" | "meals">
): number {
  const today = user.todayDate;
  const todayMeals = user.meals.filter((m) => m.date === today);
  const mealsTotal = todayMeals.reduce((s, m) => s + m.scoreChange, 0);
  const waterPoints = Math.min(8, user.waterCount) * 2;
  const challengePoints = user.todayChallengeDone ? 20 : 0;

  // Skipped breakfast penalty after 11am
  const now = new Date();
  const past11 = now.getHours() >= 11;
  const hasBreakfast = todayMeals.some((m) => m.mealType === "breakfast");
  const skipBreakfastPenalty = past11 && !hasBreakfast ? -8 : 0;

  // Late night meal flag handled at log time, not recompute
  const score = BASE_SCORE + mealsTotal + waterPoints + challengePoints + skipBreakfastPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function isLateNightMeal(timestamp: string): boolean {
  const d = new Date(timestamp);
  const h = d.getHours();
  return h >= 23 || h < 4;
}

export function lateNightPenalty(meals: Meal[], date: string): number {
  return meals.some((m) => m.date === date && isLateNightMeal(m.timestamp)) ? -5 : 0;
}

export function newDayRollover(user: User): User {
  const today = todayISO();
  if (user.todayDate === today) return user;

  // Streak logic: had at least 2 meals yesterday → streak +1, else reset
  const yesterdayMeals = user.meals.filter((m) => m.date === user.todayDate);
  const streak = yesterdayMeals.length >= 2 ? user.streak + 1 : 0;
  const longestStreak = Math.max(user.longestStreak, streak);

  return {
    ...user,
    todayDate: today,
    todayScore: BASE_SCORE,
    waterCount: 0,
    todayChallengeId: null,
    todayChallengeDone: false,
    streak,
    longestStreak,
  };
}

export function streakMilestoneReward(streak: number): number {
  if (streak === 3) return 25;
  if (streak === 7) return 50;
  if (streak === 14) return 100;
  if (streak === 30) return 200;
  return 0;
}

export function avatarStateLabel(state: AvatarState): string {
  switch (state) {
    case "tired":
      return "Tired";
    case "normal":
      return "Steady";
    case "active":
      return "Active";
    case "glowing":
      return "Glowing";
  }
}

export function energyPercent(score: number): number {
  return Math.max(5, Math.min(100, score));
}
