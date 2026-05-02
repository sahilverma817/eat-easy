export const ACCESSORIES: { id: string; label: string; emoji: string; price: number }[] = [
  { id: "headband", label: "Headband", emoji: "🎀", price: 60 },
  { id: "sunglasses", label: "Sunglasses", emoji: "🕶️", price: 90 },
  { id: "scarf", label: "Scarf", emoji: "🧣", price: 80 },
  { id: "cap", label: "Cap", emoji: "🧢", price: 70 },
  { id: "trophy", label: "Trophy", emoji: "🏆", price: 150 },
  { id: "halo", label: "Halo Glow", emoji: "✨", price: 200 },
];

export const LEVEL_PRICES: Record<number, number> = {
  2: 100,
  3: 200,
  4: 400,
  5: 800,
};
