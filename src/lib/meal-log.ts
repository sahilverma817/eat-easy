import { setUser } from "./redis";
import { HttpError } from "./session";
import { getFood } from "./foods";
import {
  calcMealScoreChange,
  isLateNightMeal,
  recomputeTodayScore,
  streakMilestoneReward,
  todayISO,
} from "./scoring";
import type { Meal, MealType, Portion, User } from "./types";

const VALID_MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

export type LogMealInput = {
  mealType: MealType;
  foodId: string;
  portion: Portion;
  addOns: string[];
};

export async function logMealForUser(
  user: User,
  input: LogMealInput
): Promise<{ meal: Meal; user: User }> {
  const food = getFood(input.foodId);
  if (!food) throw new HttpError(400, "Invalid food.");
  if (!VALID_MEAL_TYPES.includes(input.mealType)) {
    throw new HttpError(400, "Invalid meal type.");
  }

  let scoreChange = calcMealScoreChange(input.foodId, input.portion, input.addOns);
  const ts = new Date().toISOString();
  if (isLateNightMeal(ts)) scoreChange -= 5;

  const meal: Meal = {
    id: crypto.randomUUID(),
    date: todayISO(),
    timestamp: ts,
    mealType: input.mealType,
    foodId: input.foodId,
    foodName: food.name,
    portion: input.portion,
    addOns: input.addOns,
    scoreChange,
  };

  user.meals = [meal, ...user.meals].slice(0, 100);
  user.coins += 5;
  user.todayScore = recomputeTodayScore(user);

  const streakBonus = streakMilestoneReward(user.streak);
  if (streakBonus > 0 && !user.badges.includes(`streak-${user.streak}`)) {
    user.coins += streakBonus;
    user.badges.push(`streak-${user.streak}`);
  }

  await setUser(user);
  return { meal, user };
}
