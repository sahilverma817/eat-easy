"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Users, Flame, Heart } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh]">
      {/* Hero */}
      <section className="px-6 pt-12 pb-10 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(circle at 80% 0%, rgba(245,180,0,0.18) 0%, transparent 50%), radial-gradient(circle at 0% 70%, rgba(125,211,160,0.18) 0%, transparent 50%)",
          }}
        />

        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-charcoal text-mango flex items-center justify-center font-display font-bold">
              E
            </div>
            <div className="font-display font-bold text-lg">Eat Easy</div>
          </div>
          <Link href="/auth" className="text-sm font-semibold">Log in</Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ee-pill mb-3">For Indian students & young adults</div>
          <h1 className="font-display text-[40px] leading-[1.1] font-bold mb-4">
            Healthy eating,<br />made playable.
          </h1>
          <p className="text-soft text-base leading-relaxed mb-7 max-w-md">
            Log dal-chawal, dosa, biryani, even Maggi. Watch your avatar grow with every good choice. Build streaks, hit challenges, nudge your friends.
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth" className="ee-btn-mango flex items-center justify-center gap-2 py-4 text-base">
              Start your journey <ArrowRight size={18} />
            </Link>
            <div className="text-center text-xs text-soft">No subscriptions · No ads · Just food</div>
          </div>
        </motion.div>

        <div className="mt-10 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Avatar state="glowing" level={5} accessories={["sunglasses", "halo"]} size={200} />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-10 bg-white/60">
        <h2 className="font-display text-2xl font-bold mb-2">How it works</h2>
        <p className="text-soft text-sm mb-6">Four steps. No diet plans. No calorie counting.</p>
        <div className="space-y-4">
          {[
            { emoji: "🍽️", title: "Log your meal", body: "Pick from real Indian food — poha, biryani, paratha, sprouts." },
            { emoji: "⭐", title: "Get a habit score", body: "Each meal nudges your daily energy up or down. Simple." },
            { emoji: "🌱", title: "Watch your avatar", body: "Tired → steady → active → glowing. Visible growth." },
            { emoji: "👥", title: "Pull your friends in", body: "Add your gang. Compare streaks. Send nudges." },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="ee-card p-4 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-curd flex items-center justify-center text-2xl">
                {s.emoji}
              </div>
              <div>
                <div className="font-bold">{s.title}</div>
                <div className="text-soft text-sm mt-0.5">{s.body}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Avatar showcase */}
      <section className="px-6 py-10">
        <h2 className="font-display text-2xl font-bold mb-2">Your avatar grows with you</h2>
        <p className="text-soft text-sm mb-6">From sleepy to glowing — visible progress from the food you eat.</p>
        <div className="grid grid-cols-4 gap-2">
          {(["tired", "normal", "active", "glowing"] as const).map((s) => (
            <div key={s} className="ee-card p-2 text-center">
              <Avatar state={s} size={66} showAura={false} />
              <div className="text-[10px] mt-1 capitalize font-semibold">{s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* India angle */}
      <section className="px-6 py-10 bg-roti/40">
        <h2 className="font-display text-2xl font-bold mb-2">Built for Indian food</h2>
        <p className="text-soft text-sm mb-5">
          Hostel canteen, ghar ka khana, late-night Maggi — the food we actually eat.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Dal Chawal", "Dosa", "Biryani", "Poha", "Roti Sabzi", "Chai", "Idli", "Maggi", "Sprouts", "Paratha", "Curd Rice", "Khichdi"].map((f) => (
            <div key={f} className="ee-chip">{f}</div>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 py-10">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Sparkles, title: "AI insight", body: "Each meal gets a quick, real-talk tip." },
            { icon: Flame, title: "Streaks", body: "Don't break the chain. Tiny wins add up." },
            { icon: Users, title: "Friends", body: "Add your hostel gang. Stay accountable." },
            { icon: Heart, title: "Free", body: "Built for students. Always free." },
          ].map((b, i) => (
            <div key={i} className="ee-card p-4">
              <div className="w-10 h-10 rounded-2xl bg-mango/20 flex items-center justify-center mb-2">
                <b.icon size={18} className="text-mango-dark" />
              </div>
              <div className="font-bold text-sm">{b.title}</div>
              <div className="text-xs text-soft mt-1">{b.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-12 pt-4">
        <div className="ee-card p-7 text-center bg-gradient-to-br from-mango/20 to-mint/30 border-2 border-mango/30">
          <div className="text-3xl mb-2">🍛</div>
          <h2 className="font-display text-2xl font-bold mb-1">Eat better than yesterday.</h2>
          <p className="text-soft text-sm mb-5">That's the only goal.</p>
          <Link href="/auth" className="ee-btn-mango inline-flex items-center gap-2">
            Get started <ArrowRight size={16} />
          </Link>
        </div>
        <div className="text-center text-[11px] text-soft mt-6">
          Eat Easy · A NIFT Fashion Communication project · 2026
        </div>
      </section>
    </div>
  );
}
