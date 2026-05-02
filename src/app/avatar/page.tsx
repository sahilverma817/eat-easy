"use client";

import { Coins, Lock, Check, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/Avatar";
import { useMe, postJSON, refreshAll } from "@/lib/api";
import { avatarStateFor, avatarStateLabel, energyPercent } from "@/lib/scoring";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const ACCESSORIES = [
  { id: "headband", label: "Headband", emoji: "🎀", price: 60 },
  { id: "sunglasses", label: "Sunglasses", emoji: "🕶️", price: 90 },
  { id: "scarf", label: "Scarf", emoji: "🧣", price: 80 },
  { id: "cap", label: "Cap", emoji: "🧢", price: 70 },
  { id: "trophy", label: "Trophy", emoji: "🏆", price: 150 },
  { id: "halo", label: "Halo Glow", emoji: "✨", price: 200 },
];

const LEVEL_PRICES: Record<number, number> = { 2: 100, 3: 200, 4: 400, 5: 800 };
const LEVEL_LABELS: Record<number, string> = {
  1: "Mint Tee",
  2: "Red Kurta",
  3: "Blue Jacket",
  4: "Purple Hoodie",
  5: "Mango Premium",
};

export default function AvatarPage() {
  return (
    <AppShell>
      <AvatarInner />
    </AppShell>
  );
}

function AvatarInner() {
  const { data } = useMe();
  const { toast } = useToast();
  const router = useRouter();
  if (!data) return null;
  const u = data.user;
  const state = avatarStateFor(u.todayScore);
  const energy = energyPercent(u.todayScore);

  const buy = async (type: "accessory" | "level", itemId: string | number) => {
    try {
      await postJSON("/api/avatar/buy", { type, itemId });
      toast("Unlocked!", "success");
      await refreshAll();
    } catch (e: any) {
      toast(e.message, "error");
    }
  };

  const logout = async () => {
    await postJSON("/api/auth/logout", {});
    router.replace("/");
  };

  return (
    <div className="px-5 pt-8 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Avatar</h1>
        <button onClick={logout} className="text-soft text-xs flex items-center gap-1">
          <LogOut size={14} /> Log out
        </button>
      </div>

      <div className="ee-card p-6 text-center mb-4 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(circle at 50% 30%, rgba(245,180,0,0.4), transparent 60%)",
          }}
        />
        <div className="relative">
          <Avatar state={state} level={u.avatarLevel} accessories={u.unlockedAccessories} size={220} />
          <div className="ee-pill mt-2">{avatarStateLabel(state)}</div>
          <div className="font-display text-2xl font-bold mt-1">{u.displayName}</div>
          <div className="text-soft text-sm">@{u.username} · level {u.avatarLevel}</div>
        </div>
      </div>

      {/* Energy meter */}
      <div className="ee-card p-5 mb-4">
        <div className="text-xs text-soft uppercase tracking-wider font-semibold mb-2">Energy</div>
        <div className="h-3 bg-charcoal/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${energy}%`,
              background: "linear-gradient(90deg, #7DD3A0, #3FA34D)",
            }}
          />
        </div>
        <div className="text-xs text-soft mt-2">{u.todayScore}/100 · log balanced meals to grow</div>
      </div>

      {/* Outfit / level */}
      <div className="ee-card p-5 mb-4">
        <div className="font-display text-lg font-bold mb-3">Outfit</div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const owned = u.avatarLevel >= lvl;
            const next = lvl === u.avatarLevel + 1;
            const price = LEVEL_PRICES[lvl];
            return (
              <div key={lvl} className="text-center">
                <button
                  disabled={!next || (price !== undefined && u.coins < price)}
                  onClick={() => next && buy("level", lvl)}
                  className={`w-full aspect-square rounded-2xl flex items-center justify-center text-xl font-bold transition ${
                    owned
                      ? "bg-charcoal text-white"
                      : next
                      ? "bg-mango/20 border-2 border-mango"
                      : "bg-charcoal/5"
                  }`}
                >
                  {owned ? <Check size={20} /> : next ? lvl : <Lock size={14} />}
                </button>
                <div className="text-[10px] mt-1 font-semibold">{LEVEL_LABELS[lvl]}</div>
                {!owned && next && (
                  <div className="text-[10px] text-mango-dark">{price}🪙</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Accessories */}
      <div className="ee-card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-lg font-bold">Accessories</div>
          <div className="flex items-center gap-1 text-sm font-semibold">
            <Coins size={14} className="text-mango-dark" /> {u.coins}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {ACCESSORIES.map((a) => {
            const owned = u.unlockedAccessories.includes(a.id);
            const canBuy = !owned && u.coins >= a.price;
            return (
              <button
                key={a.id}
                disabled={owned || !canBuy}
                onClick={() => buy("accessory", a.id)}
                className={`p-3 rounded-2xl text-center transition ${
                  owned
                    ? "bg-leaf/10 border-2 border-leaf"
                    : canBuy
                    ? "bg-white border-2 border-charcoal/10 hover:border-charcoal/30 active:scale-[0.98]"
                    : "bg-charcoal/5 opacity-50"
                }`}
              >
                <div className="text-2xl">{a.emoji}</div>
                <div className="text-[11px] font-semibold mt-1">{a.label}</div>
                <div className="text-[10px] text-soft mt-0.5">
                  {owned ? "Owned" : `${a.price}🪙`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {u.badges.length > 0 && (
        <div className="ee-card p-5">
          <div className="font-display text-lg font-bold mb-3">Badges</div>
          <div className="flex flex-wrap gap-2">
            {u.badges.map((b) => (
              <div key={b} className="ee-chip">
                🏅 {prettyBadge(b)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function prettyBadge(id: string): string {
  if (id.startsWith("streak-")) return `${id.split("-")[1]}-day streak`;
  return id.replace(/-/g, " ");
}
