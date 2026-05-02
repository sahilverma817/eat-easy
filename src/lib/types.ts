export type AgeGroup = "18-24" | "25-30" | "30+";
export type Lifestyle = "student" | "working" | "hostel" | "home";
export type Goal =
  | "eat-cleaner"
  | "lose-weight"
  | "gain-energy"
  | "reduce-junk"
  | "build-routine";
export type FoodPreference = "veg" | "non-veg" | "eggetarian" | "jain";
export type CuisinePreference = "north" | "south" | "mixed" | "hostel";
export type MealType = "breakfast" | "lunch" | "snack" | "dinner";
export type Portion = "small" | "medium" | "large";
export type AvatarState = "tired" | "normal" | "active" | "glowing";

export type Meal = {
  id: string;
  date: string;
  timestamp: string;
  mealType: MealType;
  foodId: string;
  foodName: string;
  portion: Portion;
  addOns: string[];
  scoreChange: number;
  insight?: string;
};

export type Nudge = {
  id: string;
  fromUsername: string;
  fromDisplayName: string;
  message: string;
  createdAt: string;
};

export type User = {
  username: string;
  pinHash: string;
  createdAt: string;

  displayName: string;
  ageGroup: AgeGroup;
  lifestyle: Lifestyle;
  goal: Goal;
  foodPreference: FoodPreference;
  cuisinePreference: CuisinePreference;

  todayDate: string;
  todayScore: number;
  waterCount: number;
  todayChallengeId: string | null;
  todayChallengeDone: boolean;

  streak: number;
  longestStreak: number;
  coins: number;
  avatarLevel: number;
  unlockedAccessories: string[];
  badges: string[];

  meals: Meal[];
  challengeHistory: { id: string; completedAt: string }[];

  friends: string[];
  friendRequestsIn: string[];
  friendRequestsOut: string[];
};

export type PublicUser = Pick<
  User,
  | "username"
  | "displayName"
  | "todayScore"
  | "streak"
  | "avatarLevel"
  | "unlockedAccessories"
>;

export type FriendView = PublicUser & {
  avatarState: AvatarState;
  recap: string;
};

export type FeedActor = {
  username: string;
  displayName: string;
  avatarLevel: number;
  unlockedAccessories: string[];
};

export type FeedEvent =
  | {
      type: "meal";
      from: FeedActor;
      timestamp: string;
      meal: Pick<Meal, "foodName" | "mealType" | "scoreChange">;
    }
  | {
      type: "challenge";
      from: FeedActor;
      timestamp: string;
      challengeId: string;
    }
  | {
      type: "streak";
      from: FeedActor;
      timestamp: string;
      streak: number;
    };

export type WeekStats = {
  daysLogged: number;
  mealsLogged: number;
  challengesDone: number;
};

export type FriendProfile = PublicUser & {
  avatarState: AvatarState;
  streak: number;
  longestStreak: number;
  coins: number;
  waterCount: number;
  badges: string[];
  todayDate: string;
  todayMeals: Meal[];
  recentMeals: Meal[];
  weekStats: WeekStats;
  recap: string;
};
