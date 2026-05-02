"use client";

import { motion } from "framer-motion";
import type { AvatarState } from "@/lib/types";

type Props = {
  state: AvatarState;
  level?: number;
  accessories?: string[];
  size?: number;
  showAura?: boolean;
};

const PALETTES: Record<AvatarState, { skin: string; hair: string; cheek: string; bg: string; aura: string; }> = {
  tired: { skin: "#E0BCA0", hair: "#3B2A1F", cheek: "#E29A87", bg: "#EAE0D0", aura: "rgba(170,170,170,0.0)" },
  normal: { skin: "#F2C9A8", hair: "#321E15", cheek: "#F08D7A", bg: "#FFF1D6", aura: "rgba(245,180,0,0.18)" },
  active: { skin: "#F8D2B0", hair: "#221008", cheek: "#FF8A7A", bg: "#FFE8B5", aura: "rgba(245,180,0,0.4)" },
  glowing: { skin: "#FBDABA", hair: "#1A0905", cheek: "#FF8472", bg: "#FFD976", aura: "rgba(245,180,0,0.85)" },
};

const OUTFIT_COLORS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: "#3FA34D", secondary: "#7DD3A0" },   // green tee
  2: { primary: "#E94B3C", secondary: "#FF8A80" },   // red kurta
  3: { primary: "#3B82F6", secondary: "#93C5FD" },   // blue jacket
  4: { primary: "#8B5CF6", secondary: "#C4B5FD" },   // purple
  5: { primary: "#F5B400", secondary: "#FFD557" },   // mango premium
};

export function Avatar({ state, level = 1, accessories = [], size = 200, showAura = true }: Props) {
  const palette = PALETTES[state];
  const outfit = OUTFIT_COLORS[Math.min(5, Math.max(1, level))];

  const yOffset = state === "tired" ? 6 : 0;
  const eyeShape = state === "tired" ? "tired" : state === "glowing" ? "happy" : "normal";
  const mouthCurve =
    state === "tired" ? -8 : state === "normal" ? 0 : state === "active" ? 8 : 12;

  const animation =
    state === "tired"
      ? { y: [0, 2, 0], transition: { duration: 5, repeat: Infinity } }
      : state === "normal"
      ? { y: [0, -2, 0], transition: { duration: 4, repeat: Infinity } }
      : state === "active"
      ? { y: [0, -6, 0], transition: { duration: 2.5, repeat: Infinity } }
      : { y: [0, -8, 0], transition: { duration: 2, repeat: Infinity } };

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Aura */}
      {showAura && (state === "active" || state === "glowing") && (
        <div
          aria-hidden
          className={state === "glowing" ? "absolute inset-0 rounded-full animate-pulse-slow" : "absolute inset-0 rounded-full"}
          style={{
            background: `radial-gradient(circle, ${palette.aura} 0%, transparent 70%)`,
            filter: "blur(20px)",
          }}
        />
      )}

      {/* Sparkles for glowing */}
      {state === "glowing" && <Sparkles size={size} />}

      <motion.svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        style={{ position: "relative" }}
        animate={animation}
      >
        <defs>
          <radialGradient id="bg-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={palette.bg} stopOpacity="0.6" />
            <stop offset="100%" stopColor={palette.bg} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Body */}
        <g transform={`translate(0, ${yOffset})`}>
          {/* Torso / outfit */}
          <path
            d="M60 165 Q60 130 100 130 Q140 130 140 165 L140 195 L60 195 Z"
            fill={outfit.primary}
          />
          <path
            d="M65 165 Q65 145 80 140 L80 195 L65 195 Z"
            fill={outfit.secondary}
            opacity="0.6"
          />

          {/* Neck */}
          <rect x="92" y="118" width="16" height="14" rx="6" fill={palette.skin} />

          {/* Head */}
          <circle cx="100" cy="92" r="38" fill={palette.skin} />

          {/* Hair */}
          <path
            d="M62 92 Q62 56 100 56 Q138 56 138 92 Q138 76 100 70 Q72 70 70 88 Z"
            fill={palette.hair}
          />

          {/* Eyes */}
          {eyeShape === "normal" && (
            <>
              <circle cx="86" cy="92" r="3.5" fill="#1a1a1a" />
              <circle cx="114" cy="92" r="3.5" fill="#1a1a1a" />
            </>
          )}
          {eyeShape === "tired" && (
            <>
              <path d="M80 92 Q86 96 92 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M108 92 Q114 96 120 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {eyeShape === "happy" && (
            <>
              <path d="M80 92 Q86 86 92 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M108 92 Q114 86 120 92" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}

          {/* Cheeks */}
          {(state === "active" || state === "glowing") && (
            <>
              <circle cx="80" cy="103" r="5" fill={palette.cheek} opacity="0.55" />
              <circle cx="120" cy="103" r="5" fill={palette.cheek} opacity="0.55" />
            </>
          )}

          {/* Mouth */}
          <path
            d={`M88 110 Q100 ${110 + mouthCurve} 112 110`}
            stroke="#1a1a1a"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Accessories */}
          {accessories.includes("sunglasses") && (
            <g>
              <rect x="74" y="86" width="22" height="12" rx="4" fill="#1a1a1a" />
              <rect x="104" y="86" width="22" height="12" rx="4" fill="#1a1a1a" />
              <rect x="96" y="90" width="8" height="3" fill="#1a1a1a" />
            </g>
          )}
          {accessories.includes("headband") && (
            <path d="M60 76 Q100 64 140 76 L140 84 Q100 72 60 84 Z" fill="#E94B3C" />
          )}
          {accessories.includes("scarf") && (
            <path d="M70 130 L70 150 Q70 156 76 156 L124 156 Q130 156 130 150 L130 130 Z" fill="#F5B400" />
          )}
          {accessories.includes("cap") && (
            <>
              <path d="M60 70 Q60 50 100 50 Q140 50 140 70 Q100 60 60 70 Z" fill="#3B82F6" />
              <rect x="58" y="68" width="84" height="6" rx="3" fill="#1E40AF" />
            </>
          )}
          {accessories.includes("trophy") && (
            <g transform="translate(150, 80)">
              <path d="M0 0 L24 0 L20 18 L4 18 Z" fill="#F5B400" />
              <rect x="6" y="18" width="12" height="4" fill="#C99100" />
              <rect x="2" y="22" width="20" height="3" rx="1" fill="#8B5A00" />
            </g>
          )}
          {accessories.includes("halo") && (
            <ellipse
              cx="100"
              cy="48"
              rx="34"
              ry="6"
              fill="none"
              stroke="#FFD557"
              strokeWidth="3"
            />
          )}
        </g>
      </motion.svg>
    </div>
  );
}

function Sparkles({ size }: { size: number }) {
  const dots = [
    { x: 0.15, y: 0.2, delay: 0 },
    { x: 0.85, y: 0.18, delay: 0.5 },
    { x: 0.2, y: 0.7, delay: 1 },
    { x: 0.8, y: 0.65, delay: 1.5 },
    { x: 0.5, y: 0.05, delay: 0.8 },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: d.x * size,
            top: d.y * size,
            width: 12,
            height: 12,
            animationDelay: `${d.delay}s`,
          }}
        >
          <svg viewBox="0 0 24 24" width="12" height="12">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#F5B400" />
          </svg>
        </span>
      ))}
    </>
  );
}
