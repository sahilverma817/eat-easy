import type { MealType } from "./types";

export type FoodCuisine = "north" | "south" | "both";

export type Food = {
  id: string;
  name: string;
  emoji: string;
  category: MealType[];
  cuisine: FoodCuisine;
  veg: boolean;
  jain: boolean;
  baseScore: number;
  tags: string[];
  feedbackTemplate: string;
};

export const FOODS: Food[] = [
  // Breakfast
  { id: "poha", name: "Poha", emoji: "🍚", category: ["breakfast"], cuisine: "north", veg: true, jain: true, baseScore: 10, tags: ["light", "fibre"], feedbackTemplate: "Light, balanced breakfast. Adding peanuts or sprouts gives you a protein bump." },
  { id: "upma", name: "Upma", emoji: "🥣", category: ["breakfast"], cuisine: "south", veg: true, jain: true, baseScore: 8, tags: ["fibre"], feedbackTemplate: "Solid morning fuel. A handful of veggies makes it more filling." },
  { id: "idli", name: "Idli with Sambhar", emoji: "🍙", category: ["breakfast"], cuisine: "south", veg: true, jain: true, baseScore: 10, tags: ["steamed", "fermented"], feedbackTemplate: "Easy on the stomach and packed with good carbs. Pair with chutney for variety." },
  { id: "dosa", name: "Dosa", emoji: "🥞", category: ["breakfast"], cuisine: "south", veg: true, jain: true, baseScore: 8, tags: ["fermented"], feedbackTemplate: "Good choice. Go masala dosa for the potato fibre, or plain with sambhar for lighter." },
  { id: "paratha", name: "Paratha", emoji: "🫓", category: ["breakfast"], cuisine: "north", veg: true, jain: true, baseScore: 5, tags: ["heavy"], feedbackTemplate: "Filling start to the day. Add curd to balance the ghee, and try stuffed veg paratha for fibre." },
  { id: "bread-omelette", name: "Bread Omelette", emoji: "🍳", category: ["breakfast"], cuisine: "both", veg: false, jain: false, baseScore: 8, tags: ["protein"], feedbackTemplate: "Nice protein hit in the morning. Use multigrain bread when you can." },
  { id: "chai-biscuit", name: "Chai + Biscuit", emoji: "☕", category: ["breakfast", "snack"], cuisine: "both", veg: true, jain: true, baseScore: 0, tags: ["sugary"], feedbackTemplate: "Comfort but not really a meal. Pair with a fruit, makhana, or eggs to make it count." },
  { id: "oats", name: "Oats", emoji: "🥣", category: ["breakfast"], cuisine: "both", veg: true, jain: true, baseScore: 12, tags: ["fibre", "balanced"], feedbackTemplate: "Strong choice. Toss in nuts or banana to add taste and protein." },
  { id: "bread-jam", name: "Bread + Jam", emoji: "🍞", category: ["breakfast"], cuisine: "both", veg: true, jain: true, baseScore: -2, tags: ["sugary"], feedbackTemplate: "Quick but mostly sugar. Swap jam for peanut butter or boiled egg next time." },

  // Lunch / Dinner
  { id: "dal-chawal", name: "Dal Chawal", emoji: "🍛", category: ["lunch", "dinner"], cuisine: "both", veg: true, jain: true, baseScore: 15, tags: ["balanced", "protein", "fibre"], feedbackTemplate: "Classic balanced plate. Add a sabzi or salad and you're set." },
  { id: "rajma-chawal", name: "Rajma Chawal", emoji: "🍚", category: ["lunch", "dinner"], cuisine: "north", veg: true, jain: false, baseScore: 12, tags: ["protein", "fibre"], feedbackTemplate: "Plant protein winner. Curd on the side helps digestion." },
  { id: "chole-chawal", name: "Chole Chawal", emoji: "🍛", category: ["lunch", "dinner"], cuisine: "north", veg: true, jain: false, baseScore: 11, tags: ["protein", "fibre"], feedbackTemplate: "Great fibre and protein combo. Watch out for too much oil at canteens." },
  { id: "roti-sabzi", name: "Roti Sabzi", emoji: "🫓", category: ["lunch", "dinner"], cuisine: "north", veg: true, jain: true, baseScore: 12, tags: ["balanced", "fibre"], feedbackTemplate: "Balanced, light, dependable. Swap one roti for a salad if you want lighter." },
  { id: "thali", name: "Mixed Thali", emoji: "🍽️", category: ["lunch", "dinner"], cuisine: "both", veg: true, jain: true, baseScore: 13, tags: ["balanced"], feedbackTemplate: "Variety wins. You're hitting most food groups in one plate." },
  { id: "biryani", name: "Biryani", emoji: "🥘", category: ["lunch", "dinner"], cuisine: "both", veg: false, jain: false, baseScore: 5, tags: ["heavy"], feedbackTemplate: "Enjoy it. Pair with raita and skip the cold drink to keep things in check." },
  { id: "veg-biryani", name: "Veg Biryani", emoji: "🥘", category: ["lunch", "dinner"], cuisine: "both", veg: true, jain: false, baseScore: 6, tags: ["heavy"], feedbackTemplate: "Good veggie option. Raita on the side and you're balanced." },
  { id: "curd-rice", name: "Curd Rice", emoji: "🍚", category: ["lunch", "dinner"], cuisine: "south", veg: true, jain: true, baseScore: 10, tags: ["light", "probiotic"], feedbackTemplate: "Easy on the gut, especially after a heavy day. Add a vegetable or pickle for taste." },
  { id: "dosa-sambhar", name: "Dosa Sambhar", emoji: "🥞", category: ["lunch", "dinner"], cuisine: "south", veg: true, jain: true, baseScore: 9, tags: ["fermented"], feedbackTemplate: "Light meal, fermented goodness. Add a side veg curry to round it out." },
  { id: "paneer-roll", name: "Paneer Roll", emoji: "🌯", category: ["lunch", "dinner", "snack"], cuisine: "north", veg: true, jain: false, baseScore: 5, tags: ["protein"], feedbackTemplate: "Decent protein. Multigrain wrap or extra veggies make it a stronger meal." },
  { id: "chole-bhature", name: "Chole Bhature", emoji: "🫓", category: ["lunch", "dinner"], cuisine: "north", veg: true, jain: false, baseScore: -2, tags: ["fried", "heavy"], feedbackTemplate: "Treat meal. Maybe lighter dinner today and a glass of buttermilk to balance." },
  { id: "chicken-curry", name: "Chicken Curry + Rice", emoji: "🍗", category: ["lunch", "dinner"], cuisine: "both", veg: false, jain: false, baseScore: 10, tags: ["protein"], feedbackTemplate: "Solid protein meal. Add a salad or sabzi to push fibre up." },
  { id: "egg-curry", name: "Egg Curry + Rice", emoji: "🍳", category: ["lunch", "dinner"], cuisine: "both", veg: false, jain: false, baseScore: 9, tags: ["protein"], feedbackTemplate: "Eggs are a complete protein. Goes well with phulka instead of rice for lighter days." },
  { id: "fish-curry", name: "Fish Curry + Rice", emoji: "🐟", category: ["lunch", "dinner"], cuisine: "both", veg: false, jain: false, baseScore: 11, tags: ["protein", "omega3"], feedbackTemplate: "Great choice. Omega-3s and lean protein in one plate." },
  { id: "paneer-bhurji", name: "Paneer Bhurji + Roti", emoji: "🧀", category: ["lunch", "dinner"], cuisine: "north", veg: true, jain: false, baseScore: 11, tags: ["protein"], feedbackTemplate: "Strong veg protein. Use less oil if you make it at home." },
  { id: "khichdi", name: "Khichdi", emoji: "🍚", category: ["lunch", "dinner"], cuisine: "both", veg: true, jain: true, baseScore: 12, tags: ["light", "balanced"], feedbackTemplate: "One-pot wonder. Add ghee and a pickle for flavour, or some veggies for fibre." },
  { id: "pasta", name: "Pasta", emoji: "🍝", category: ["lunch", "dinner"], cuisine: "both", veg: true, jain: false, baseScore: 2, tags: ["heavy"], feedbackTemplate: "Refined carbs hit hard. Tomato base over creamy, add veggies to make it decent." },

  // Snacks
  { id: "samosa", name: "Samosa", emoji: "🥟", category: ["snack"], cuisine: "north", veg: true, jain: false, baseScore: -8, tags: ["fried"], feedbackTemplate: "Once in a while is fine. Pair with some fruit later to even out the day." },
  { id: "vada-pav", name: "Vada Pav", emoji: "🍔", category: ["snack"], cuisine: "north", veg: true, jain: false, baseScore: -6, tags: ["fried", "refined"], feedbackTemplate: "Tasty but heavy on refined carbs and oil. Limit to once a week if you can." },
  { id: "maggi", name: "Maggi", emoji: "🍜", category: ["snack", "dinner"], cuisine: "both", veg: true, jain: false, baseScore: -5, tags: ["refined", "salty"], feedbackTemplate: "Hostel classic. Add veggies and a boiled egg or paneer to make it a real meal." },
  { id: "fruit-bowl", name: "Fruit Bowl", emoji: "🍎", category: ["snack", "breakfast"], cuisine: "both", veg: true, jain: true, baseScore: 12, tags: ["fibre", "vitamins"], feedbackTemplate: "Top-tier snack. Mix a few fruits for different vitamins." },
  { id: "sprouts", name: "Sprouts", emoji: "🌱", category: ["snack", "breakfast"], cuisine: "both", veg: true, jain: false, baseScore: 12, tags: ["protein", "fibre"], feedbackTemplate: "High protein, light on stomach. Squeeze lemon and chaat masala for taste." },
  { id: "makhana", name: "Roasted Makhana", emoji: "🌰", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: 8, tags: ["light"], feedbackTemplate: "Smart snack swap. Light, crunchy, no guilt." },
  { id: "chai", name: "Chai", emoji: "☕", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: 0, tags: ["caffeine"], feedbackTemplate: "Just chai is fine. Watch the sugar — try less or use jaggery." },
  { id: "cold-drink", name: "Cold Drink", emoji: "🥤", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: -10, tags: ["sugary"], feedbackTemplate: "Quick hit of sugar. Buttermilk, nimbu paani, or coconut water are way better picks." },
  { id: "nimbu-pani", name: "Nimbu Paani", emoji: "🍋", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: 6, tags: ["hydration"], feedbackTemplate: "Refreshing and hydrating. Less sugar, more lemon — your gut will thank you." },
  { id: "sandwich", name: "Veg Sandwich", emoji: "🥪", category: ["snack", "breakfast"], cuisine: "both", veg: true, jain: false, baseScore: 3, tags: ["balanced"], feedbackTemplate: "Decent choice. Multigrain bread + extra veggies bumps it up." },
  { id: "bhel", name: "Bhel Puri", emoji: "🥗", category: ["snack"], cuisine: "north", veg: true, jain: false, baseScore: 2, tags: ["light"], feedbackTemplate: "Lighter street snack. Watch the chutneys for sugar." },
  { id: "pani-puri", name: "Pani Puri", emoji: "🥟", category: ["snack"], cuisine: "north", veg: true, jain: false, baseScore: -3, tags: ["fried", "salty"], feedbackTemplate: "Comfort food. Don't make it dinner — eat something balanced after." },
  { id: "nuts", name: "Mixed Nuts", emoji: "🥜", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: 8, tags: ["protein", "fats"], feedbackTemplate: "Healthy fats and protein. A small handful is enough." },
  { id: "yogurt", name: "Curd / Yogurt Bowl", emoji: "🥛", category: ["snack", "breakfast"], cuisine: "both", veg: true, jain: true, baseScore: 9, tags: ["probiotic", "protein"], feedbackTemplate: "Gut-friendly and protein-rich. Add fruit or honey for taste." },
  { id: "boiled-egg", name: "Boiled Eggs", emoji: "🥚", category: ["snack", "breakfast"], cuisine: "both", veg: false, jain: false, baseScore: 10, tags: ["protein"], feedbackTemplate: "Cheap, easy, protein-packed. One of the best snacks going." },
  { id: "ice-cream", name: "Ice Cream", emoji: "🍨", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: -7, tags: ["sugary"], feedbackTemplate: "Treat status. Once-a-week sized scoop, not a bucket." },
  { id: "biscuit-pack", name: "Pack of Biscuits", emoji: "🍪", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: -6, tags: ["sugary", "refined"], feedbackTemplate: "Refined sugar bomb. Makhana or fruit fills you up better." },
  { id: "chips", name: "Chips Packet", emoji: "🍟", category: ["snack"], cuisine: "both", veg: true, jain: true, baseScore: -8, tags: ["fried", "salty"], feedbackTemplate: "Empty calories. Roasted chana or makhana is a smart switch." },
  { id: "lassi-sweet", name: "Sweet Lassi", emoji: "🥛", category: ["snack"], cuisine: "north", veg: true, jain: true, baseScore: -3, tags: ["sugary"], feedbackTemplate: "Plain or salted lassi is way better. Sweet version is mostly sugar." },
  { id: "lassi-salt", name: "Salted Lassi", emoji: "🥛", category: ["snack"], cuisine: "north", veg: true, jain: true, baseScore: 5, tags: ["probiotic"], feedbackTemplate: "Cooling and probiotic-rich. Solid pick after a heavy meal." },
  { id: "milk", name: "Glass of Milk", emoji: "🥛", category: ["snack", "breakfast"], cuisine: "both", veg: true, jain: true, baseScore: 8, tags: ["calcium", "protein"], feedbackTemplate: "Simple, nourishing, no fuss. Skip the sugar." },
  { id: "pakora", name: "Pakora", emoji: "🥟", category: ["snack"], cuisine: "north", veg: true, jain: false, baseScore: -7, tags: ["fried"], feedbackTemplate: "Monsoon move. One plate is enough — pair with chai and stop there." },
];

export const PORTION_MULTIPLIER: Record<string, number> = {
  small: 0.7,
  medium: 1,
  large: 1.2,
};

export type AddOn = {
  id: string;
  label: string;
  delta: number;
};

export const ADD_ONS: AddOn[] = [
  { id: "curd", label: "Curd / Raita", delta: 3 },
  { id: "salad", label: "Salad", delta: 4 },
  { id: "fruit", label: "Fruit", delta: 3 },
  { id: "sweet", label: "Sweet / Dessert", delta: -4 },
  { id: "cold-drink", label: "Cold Drink", delta: -6 },
  { id: "fried-side", label: "Fried Side", delta: -5 },
  { id: "extra-ghee", label: "Extra Ghee / Butter", delta: -2 },
];

export function getFood(id: string): Food | undefined {
  return FOODS.find((f) => f.id === id);
}

export function getAddOn(id: string): AddOn | undefined {
  return ADD_ONS.find((a) => a.id === id);
}

export function filterFoodsForUser(prefs: {
  foodPreference: "veg" | "non-veg" | "eggetarian" | "jain";
  cuisinePreference: "north" | "south" | "mixed" | "hostel";
}): Food[] {
  return FOODS.filter((f) => {
    if (prefs.foodPreference === "veg" && !f.veg) return false;
    if (prefs.foodPreference === "jain" && !f.jain) return false;
    if (prefs.foodPreference === "eggetarian" && !f.veg) {
      // allow eggs only
      if (!["bread-omelette", "boiled-egg", "egg-curry"].includes(f.id))
        return false;
    }
    if (prefs.cuisinePreference === "north" && f.cuisine === "south") return false;
    if (prefs.cuisinePreference === "south" && f.cuisine === "north") return false;
    return true;
  });
}
