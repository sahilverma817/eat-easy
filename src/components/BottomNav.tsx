"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User as UserIcon, Trophy, Users, Utensils } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/log", label: "Log", icon: Utensils },
  { href: "/avatar", label: "Avatar", icon: UserIcon },
  { href: "/challenges", label: "Goals", icon: Trophy },
  { href: "/friends", label: "Friends", icon: Users },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="app-shell pointer-events-auto">
        <div className="m-3 mb-4 ee-card flex items-center justify-around py-2 px-1 backdrop-blur-md bg-white/95">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href === "/log" && path?.startsWith("/log"));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition ${
                  active ? "bg-charcoal text-white" : "text-charcoal/70"
                }`}
              >
                <Icon size={20} strokeWidth={2.2} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
