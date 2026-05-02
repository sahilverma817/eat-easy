export type Challenge = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: "daily" | "weekly";
  rewardCoins: number;
  hint?: string;
};

export const DAILY_CHALLENGES: Challenge[] = [
  { id: "fruit-today", title: "Add a fruit", description: "Have at least one fruit today.", emoji: "🍎", type: "daily", rewardCoins: 20, hint: "Banana, apple, papaya — any one counts." },
  { id: "water-6", title: "Drink 6 glasses of water", description: "Hit the water goal — 6 glasses.", emoji: "💧", type: "daily", rewardCoins: 20 },
  { id: "no-cold-drink", title: "No cold drink today", description: "Skip the soda. Try nimbu paani instead.", emoji: "🚫", type: "daily", rewardCoins: 20 },
  { id: "protein-lunch", title: "Add protein to lunch", description: "Dal, paneer, eggs, sprouts — pick one.", emoji: "💪", type: "daily", rewardCoins: 20 },
  { id: "early-dinner", title: "Eat dinner before 10pm", description: "Try to finish dinner early.", emoji: "🌙", type: "daily", rewardCoins: 25 },
  { id: "log-3-meals", title: "Log all 3 main meals", description: "Breakfast, lunch and dinner.", emoji: "🍽️", type: "daily", rewardCoins: 25 },
  { id: "roasted-not-fried", title: "Choose roasted over fried", description: "Pick makhana, roasted chana, or grilled options.", emoji: "🌰", type: "daily", rewardCoins: 20 },
  { id: "no-sugary-snack", title: "No sugary snack", description: "Skip sweets, biscuits, ice cream today.", emoji: "🍬", type: "daily", rewardCoins: 20 },
  { id: "homefood", title: "Eat home / hostel food", description: "Skip ordering — eat ghar ka khana.", emoji: "🏠", type: "daily", rewardCoins: 25 },
  { id: "veg-with-dinner", title: "Veggie with dinner", description: "Have a sabzi or salad with dinner.", emoji: "🥗", type: "daily", rewardCoins: 20 },
  { id: "breakfast-on-time", title: "Don't skip breakfast", description: "Log breakfast before 11am.", emoji: "🌅", type: "daily", rewardCoins: 25 },
  { id: "curd-with-meal", title: "Add curd to a meal", description: "Curd or raita with one of your meals.", emoji: "🥛", type: "daily", rewardCoins: 20 },
];

export const WEEKLY_CHALLENGES: Challenge[] = [
  { id: "no-fried-3", title: "No fried snacks for 3 days", description: "Make it 3 fried-free days this week.", emoji: "🚫", type: "weekly", rewardCoins: 60 },
  { id: "breakfast-streak-7", title: "7-day breakfast streak", description: "Log breakfast every day this week.", emoji: "🌅", type: "weekly", rewardCoins: 80 },
  { id: "homefood-5", title: "5 days of home food", description: "Skip outside food 5 days this week.", emoji: "🏠", type: "weekly", rewardCoins: 70 },
  { id: "water-streak-5", title: "Hydration hero (5 days)", description: "Hit water goal 5 out of 7 days.", emoji: "💧", type: "weekly", rewardCoins: 60 },
];

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function dailyChallengeFor(username: string, dateISO: string): Challenge {
  const hash = hashString(`${username}-${dateISO}`);
  return DAILY_CHALLENGES[hash % DAILY_CHALLENGES.length];
}

export function getChallenge(id: string): Challenge | undefined {
  return [...DAILY_CHALLENGES, ...WEEKLY_CHALLENGES].find((c) => c.id === id);
}
