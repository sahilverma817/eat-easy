"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useMe, postJSON, refreshAll } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { ADD_ONS, FOODS, filterFoodsForUser, getFood, type Food } from "@/lib/foods";
import { calcMealScoreChange } from "@/lib/scoring";
import type { MealType, Portion } from "@/lib/types";

export default function LogPage() {
  return (
    <AppShell>
      <LogInner />
    </AppShell>
  );
}

const MEAL_TYPES: { id: MealType; label: string; emoji: string; hint: string }[] = [
  { id: "breakfast", label: "Breakfast", emoji: "🌅", hint: "Start the day right" },
  { id: "lunch", label: "Lunch", emoji: "☀️", hint: "Mid-day meal" },
  { id: "snack", label: "Snack", emoji: "🍎", hint: "Quick bite" },
  { id: "dinner", label: "Dinner", emoji: "🌙", hint: "End the day light" },
];

const PORTIONS: { id: Portion; label: string }[] = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

function LogInner() {
  const router = useRouter();
  const { data, mutate } = useMe();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [mealType, setMealType] = useState<MealType | null>(null);
  const [foodId, setFoodId] = useState<string | null>(null);
  const [portion, setPortion] = useState<Portion>("medium");
  const [addOns, setAddOns] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ scoreChange: number; insight: string; food: Food } | null>(null);

  if (!data) return null;
  const u = data.user;

  const visibleFoods = useMemo(() => {
    const all = filterFoodsForUser({ foodPreference: u.foodPreference, cuisinePreference: u.cuisinePreference });
    if (!mealType) return all;
    return all.filter((f) => f.category.includes(mealType));
  }, [u.foodPreference, u.cuisinePreference, mealType]);

  const selectedFood = foodId ? getFood(foodId) : null;
  const projected = foodId ? calcMealScoreChange(foodId, portion, addOns) : 0;

  const submit = async () => {
    if (!mealType || !foodId || !selectedFood) return;
    setBusy(true);
    try {
      const [mealRes, insightRes] = await Promise.all([
        postJSON<{ meal: any }>("/api/meals", { mealType, foodId, portion, addOns }),
        postJSON<{ insight: string }>("/api/insight", { mealType, foodId, portion, addOns }),
      ]);
      await refreshAll();
      setResult({
        scoreChange: mealRes.meal.scoreChange,
        insight: insightRes.insight,
        food: selectedFood,
      });
    } catch (e: any) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep(0);
    setMealType(null);
    setFoodId(null);
    setPortion("medium");
    setAddOns([]);
    setResult(null);
  };

  // Result modal
  if (result) {
    return (
      <div className="px-5 pt-10 pb-10 min-h-[100dvh] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ee-card p-7 text-center mb-4"
        >
          <div className="text-6xl mb-2">{result.food.emoji}</div>
          <div className="font-display text-2xl font-bold">{result.food.name}</div>
          <div className="text-soft text-sm capitalize mt-1">{portion} portion</div>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`mt-5 inline-block px-6 py-3 rounded-full text-2xl font-bold ${
              result.scoreChange >= 0 ? "bg-leaf text-white" : "bg-tomato text-white"
            }`}
          >
            {result.scoreChange >= 0 ? "+" : ""}{result.scoreChange} energy
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="ee-card p-5 mb-4 bg-mango/10 border border-mango/30"
        >
          <div className="flex items-center gap-2 mb-2 text-mango-dark">
            <Sparkles size={16} />
            <div className="text-xs uppercase font-semibold tracking-wider">Eat Easy Insight</div>
          </div>
          <div className="text-sm leading-relaxed">{result.insight}</div>
        </motion.div>

        <div className="flex-1" />
        <div className="flex gap-3">
          <button onClick={reset} className="ee-btn-outline flex-1">Log another</button>
          <button onClick={() => router.push("/dashboard")} className="ee-btn-mango flex-1">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-8 pb-4">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-bold">Log meal</h1>
        <div className="flex items-center gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-charcoal" : "bg-charcoal/10"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-soft text-sm mb-4">What kind of meal?</div>
            <div className="grid grid-cols-2 gap-3">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMealType(m.id);
                    setStep(1);
                  }}
                  className="ee-card p-5 text-left active:scale-[0.98] transition"
                >
                  <div className="text-3xl mb-2">{m.emoji}</div>
                  <div className="font-bold">{m.label}</div>
                  <div className="text-[11px] text-soft mt-0.5">{m.hint}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && mealType && (
          <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-soft text-sm">Pick what you ate</div>
              <button onClick={() => setStep(0)} className="text-soft text-xs">change meal</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {visibleFoods.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setFoodId(f.id);
                    setStep(2);
                  }}
                  className="ee-card p-4 text-left active:scale-[0.98] transition"
                >
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <div className="font-semibold text-sm">{f.name}</div>
                  <div className={`text-[11px] mt-1 font-semibold ${f.baseScore >= 0 ? "text-leaf" : "text-tomato"}`}>
                    {f.baseScore >= 0 ? "+" : ""}{f.baseScore} base
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && selectedFood && (
          <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="ee-card p-5 mb-4 flex items-center gap-3">
              <div className="text-4xl">{selectedFood.emoji}</div>
              <div className="flex-1">
                <div className="font-bold">{selectedFood.name}</div>
                <div className="text-[11px] text-soft capitalize">{mealType}</div>
              </div>
              <button onClick={() => setStep(1)} className="text-soft text-xs">change</button>
            </div>

            <div className="text-soft text-xs uppercase tracking-wider font-semibold mb-2">Portion</div>
            <div className="flex gap-2 mb-5">
              {PORTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPortion(p.id)}
                  className={`flex-1 py-3 rounded-2xl font-semibold border-2 transition ${
                    portion === p.id
                      ? "border-charcoal bg-charcoal text-white"
                      : "border-charcoal/10 bg-white text-charcoal"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="text-soft text-xs uppercase tracking-wider font-semibold mb-2">Add-ons (optional)</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {ADD_ONS.map((a) => {
                const on = addOns.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() =>
                      setAddOns((cur) => (on ? cur.filter((x) => x !== a.id) : [...cur, a.id]))
                    }
                    className={`px-3 py-2 rounded-full text-sm font-medium border-2 transition ${
                      on
                        ? a.delta >= 0
                          ? "border-leaf bg-leaf/10 text-leaf"
                          : "border-tomato bg-tomato/10 text-tomato"
                        : "border-charcoal/10 bg-white text-charcoal"
                    }`}
                  >
                    {a.label} {a.delta >= 0 ? "+" : ""}{a.delta}
                  </button>
                );
              })}
            </div>

            <div className="ee-card p-4 mb-4 bg-curd flex items-center justify-between">
              <div>
                <div className="text-xs text-soft">Score change</div>
                <div className={`font-display text-2xl font-bold ${projected >= 0 ? "text-leaf" : "text-tomato"}`}>
                  {projected >= 0 ? "+" : ""}{projected}
                </div>
              </div>
              <div className="text-xs text-soft text-right">
                Today's score will be<br />
                <span className="font-semibold text-charcoal">~{Math.max(0, Math.min(100, u.todayScore + projected))}</span>
              </div>
            </div>

            <button
              onClick={submit}
              disabled={busy}
              className="ee-btn-mango w-full disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {busy ? "Saving…" : "Log this meal"}
              {!busy && <Sparkles size={16} />}
            </button>
            <div className="text-[11px] text-soft text-center mt-2">
              We'll add a quick AI insight after you log
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
