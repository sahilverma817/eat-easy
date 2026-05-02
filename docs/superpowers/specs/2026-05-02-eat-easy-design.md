# Eat Easy — Design Spec

**Date:** 2026-05-02
**Project:** NIFT Fashion Communication 4th-sem submission
**Goal:** Working web app deployed to a public URL that 5–6 friends can use to log Indian meals, watch an avatar evolve, build streaks, and nudge each other.

## Concept

A gamified healthy-eating companion for Indian students and young adults. Daily food choices feed a habit score. Score drives an evolving avatar (tired → normal → active → glowing). Streaks, daily challenges, coins, and friend nudges keep users coming back.

The hook is the avatar + the Indian food angle. Healthy eating without western diet pressure.

## Target user

Indian college students / young working adults, 18–28, eating a mix of hostel/home/canteen/street food. They want a small daily nudge, not a strict diet plan.

## Tech stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** framer-motion
- **Icons:** lucide-react
- **State:** React Context + custom hooks; SWR for server data
- **Backend:** Next.js API routes (server-side only)
- **Database:** Upstash Redis (via Vercel marketplace, free tier)
- **AI:** Google Gemini API via `@google/genai` (server-side)
- **Auth:** Custom — username + 4-digit PIN, signed session cookie (jose library)
- **Deploy:** Vercel + custom subdomain
- **Share card generation:** html2canvas

## Data architecture

All persistent data lives on the server (Upstash Redis). The client caches a snapshot in `sessionStorage` for instant first paint, but the source of truth is the server.

### Redis key schema

```
user:{username}              → JSON blob (full user state)
session:{sessionId}          → username (TTL 30 days)
nudge-inbox:{username}       → list of nudge JSON objects
```

### User blob shape

```ts
type User = {
  username: string;            // unique, lowercase, 3-15 chars
  pinHash: string;             // bcrypt of 4-digit PIN
  createdAt: string;           // ISO date

  // Onboarding
  displayName: string;
  ageGroup: '18-24' | '25-30' | '30+';
  lifestyle: 'student' | 'working' | 'hostel' | 'home';
  goal: 'eat-cleaner' | 'lose-weight' | 'gain-energy' | 'reduce-junk' | 'build-routine';
  foodPreference: 'veg' | 'non-veg' | 'eggetarian' | 'jain';
  cuisinePreference: 'north' | 'south' | 'mixed' | 'hostel';

  // Daily state
  todayDate: string;           // YYYY-MM-DD
  todayScore: number;          // 0-100, resets at midnight
  waterCount: number;          // 0-8 glasses, resets at midnight
  todayChallengeId: string | null;
  todayChallengeDone: boolean;

  // Persistent state
  streak: number;              // consecutive days with at least one meal logged
  longestStreak: number;
  coins: number;
  avatarLevel: number;         // 1-5
  unlockedAccessories: string[];
  badges: string[];

  // History
  meals: Meal[];               // capped at last 60 entries to stay under Redis size limits
  challengeHistory: { id: string; completedAt: string }[];

  // Social
  friends: string[];           // usernames
  friendRequestsIn: string[];
  friendRequestsOut: string[];
};

type Meal = {
  id: string;
  date: string;                // YYYY-MM-DD
  timestamp: string;           // ISO
  mealType: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  foodId: string;
  foodName: string;
  portion: 'small' | 'medium' | 'large';
  addOns: string[];            // e.g. ['curd', 'salad']
  scoreChange: number;
  insight?: string;            // AI-generated, cached
};

type Nudge = {
  id: string;
  fromUsername: string;
  fromDisplayName: string;
  message: string;             // preset, e.g. "Don't break the streak!"
  createdAt: string;
};
```

## Screens (mobile-first)

1. **Landing** (`/`) — Hero, concept, avatar preview, CTA to sign up
2. **Sign up / Login** (`/auth`) — Tabs for new/returning. Username + PIN.
3. **Onboarding** (`/onboarding`) — 5-card quiz (lifestyle, goal, food pref, cuisine, display name)
4. **Dashboard** (`/dashboard`) — Avatar, score ring, streak, water tracker, today's challenge, log-meal CTA, friend strip
5. **Log meal** (`/log`) — Meal type → food picker (filtered by cuisine pref) → portion → add-ons → submit. After submit: AI insight modal + score animation.
6. **Avatar room** (`/avatar`) — Larger avatar, energy meter, accessories grid (locked/unlocked), badges
7. **Challenges** (`/challenges`) — Today's challenge card, weekly challenges, completed badges
8. **Friends** (`/friends`) — Friend list with live stats, pending requests, add-by-username, nudge buttons, share-progress button

Bottom tab bar across screens 4–8: Home / Avatar / Challenges / Friends.

## Avatar system

A single `<Avatar>` component takes `state` and `level` props.

**State** is computed from `todayScore`:
- 0–30 → tired (drooping pose, dull palette, sleepy eyes)
- 31–60 → normal (neutral pose, mid palette)
- 61–80 → active (smile, bright palette, gentle bounce)
- 81–100 → glowing (sparkle particles, halo aura, brightest palette)

**Level** is bought via coins (1=base, 2=outfit-1, 3=outfit-2, 4=outfit-3, 5=premium). Higher levels unlock accessory slots.

**Accessories** (purchasable with coins): headband, sunglasses, scarf, glow-aura, trophy. Persist across day/state.

Built as layered SVG inside one React component. Tailwind classes drive color shifts; framer-motion drives the per-state idle animation.

## Indian food database

~50 hardcoded items in `src/lib/foods.ts`:

```ts
type Food = {
  id: string;
  name: string;
  emoji: string;
  category: 'breakfast' | 'lunch-dinner' | 'snack' | 'drink';
  cuisine: 'north' | 'south' | 'both';
  veg: boolean;
  baseScore: number;           // -15 to +15
  tags: string[];              // ['fried', 'sugary', 'protein', 'fibre', 'balanced']
  feedbackTemplate: string;    // fallback when AI fails
};
```

Examples: Poha (+10), Dosa (+8), Dal Chawal (+15), Roti Sabzi (+12), Biryani (+5), Samosa (-8), Vada Pav (-6), Maggi (-5), Cold Drink (-10), Fruit (+10), Sprouts (+12), Chai (+0), Curd Rice (+10), Paneer Roll (+5), Chole Bhature (-2), Idli (+10), Upma (+8), Paratha (+5), Bread Omelette (+8), Rajma Chawal (+12), Thali (+13), Makhana (+8), Fruit Bowl (+12), Sweet Lassi (-3), Milk (+8), Sandwich (+3).

Portion modifier: small ×0.7, medium ×1, large ×1.2.
Add-on modifier: curd +3, salad +4, sweet -4, cold drink -6, fried side -5.

## Score system

```
todayScore = clamp(0..100, baseScore + sum(mealEffects) + waterPoints + challengePoints)
```

- `baseScore` = 50 each morning
- `mealEffects` = `food.baseScore × portionMultiplier + addOnDelta`
- `waterPoints` = 2 per glass up to 8 glasses (max +16)
- `challengePoints` = +20 if today's challenge completed
- Skipped breakfast (no breakfast logged by 11am): -8 (computed lazily on dashboard load if past 11am)
- Late-night meal (logged after 11pm): -5

Streak rules: at least 2 meals logged in a day → streak +1 next day. Miss a day → streak resets.

## AI insights (Gemini)

`POST /api/insight` body: `{ foodId, portion, addOns, mealType, todayMeals, goal }`.

Server constructs prompt:
```
You're Eat Easy, a friendly Indian food coach. The user just logged: {food} ({portion}) with {addOns}.
Their other meals today: {list}. Their goal: {goal}.
Reply in 2 short sentences. Be specific, warm, practical. Suggest one tweak.
Use casual Indian English. No medical claims. No emojis.
```

Response cached client-side keyed by `(foodId|portion|addOnsHash|goal)` to avoid duplicate API calls. If Gemini fails or rate-limits, fall back to `food.feedbackTemplate`.

## Challenges

Static pool of 12 daily challenges in `src/lib/challenges.ts`. One assigned per user per day (deterministic hash of username+date so it's stable).

Examples:
- Add a fruit today
- Drink 6 glasses of water
- No cold drink today
- Add protein to lunch
- Eat dinner before 10pm
- Log all 3 main meals
- Choose roasted over fried
- No sugary snack today

Detection logic runs on every meal log + water log + dashboard load.

Weekly challenges: 1 per week, harder (no fried snacks for 3 days, 7-day breakfast streak, etc).

## Coins & rewards

- Log a meal: +5
- Complete daily challenge: +20
- Complete weekly challenge: +50
- Reach a streak milestone (3, 7, 14, 30): +25/+50/+100/+200
- Hit water goal: +10

Spend on:
- Accessories: 50–200 coins
- Avatar level upgrade: 100/200/400/800 coins

## Friends & social

**Add friend by username:** sends a friend request stored in target's `friendRequestsIn`. Target accepts → mutual entry in `friends[]`.

**Friend list:** shows username, displayName, current streak, today's score, avatar state. Pulls from `user:{friendUsername}` (read-only public fields).

**Nudge:** preset messages ("Drink water!", "Don't break the streak!", "Log lunch!"). Goes into target's `nudge-inbox`. Target sees a toast on next page load + a notification dot.

**Share progress:** generates a downloadable PNG card with avatar + today's stats via html2canvas. User shares to WhatsApp/Insta manually.

No global leaderboards. No public feed. No DM.

## API routes

```
POST   /api/auth/signup            { username, pin, displayName, onboarding... }
POST   /api/auth/login             { username, pin }
POST   /api/auth/logout
GET    /api/me                     → User
POST   /api/meals                  { mealType, foodId, portion, addOns }
POST   /api/water                  → increments waterCount
POST   /api/challenges/complete    { challengeId }
POST   /api/avatar/buy             { itemId }   // accessory or level
POST   /api/insight                { ... } → { insight: string }

GET    /api/friends                → Friend[]
POST   /api/friends/request        { username }
POST   /api/friends/accept         { username }
POST   /api/friends/decline        { username }
POST   /api/friends/nudge          { username, message }
GET    /api/nudges                 → Nudge[] + clears inbox
```

All routes (except auth) require a valid session cookie.

## Auth flow

- Signup: validate username (lowercase, 3–15 chars, alphanumeric + underscore), unique check via Redis `user:{username}` GET. PIN 4 digits, bcrypt-hashed. Onboarding fields submitted in same payload. Issue session cookie.
- Login: lookup user, compare PIN. Issue session.
- Session: 30-day signed JWT (jose), HttpOnly cookie. Middleware on `/api/*` (except auth) verifies.
- No password reset (acceptable for demo). User can recreate account if PIN forgotten.

## Visual design

**Palette:**
- Mango yellow `#F5B400` (primary CTA)
- Mint green `#7DD3A0` (success/score)
- Tomato red `#E94B3C` (junk warning)
- Curd white `#FFF8EC` (background)
- Roti beige `#F1E4CB` (cards)
- Leaf green `#3FA34D` (active state)
- Charcoal `#2A2A2A` (text)

**Typography:** Manrope (display) + Inter (body), via `next/font`.

**Components:** rounded-3xl cards, soft shadows, big touch targets, progress rings, food chips, streak flame icon, reward popups with confetti.

**Layout:** mobile-first 390px, scaled up via Tailwind container. Bottom tab nav fixed. Top header with greeting + avatar mini.

## Out of scope (do not build)

- Real-time chat
- Push notifications
- Image upload / photo logging
- Calorie counts or macro tracking
- AI diet plans / weekly recommendations
- Public leaderboards / activity feeds
- Email / phone / OAuth login
- Password reset flow
- Multiple languages (English only for v1)
- Admin dashboard
- Analytics

## Deployment plan

1. Push repo to GitHub
2. Import to Vercel
3. Vercel Storage tab → Create Database → Upstash Redis (one-click, auto-injects `KV_*` env vars)
4. Add `GEMINI_API_KEY` env var (user-provided)
5. Add `SESSION_SECRET` env var (random 32-byte hex)
6. Deploy. Get `eateasy.vercel.app` (or similar).
7. Test signup with 5–6 friends.

## Success criteria

- All 8 screens designed and working
- Real auth, real friend interactions across devices
- AI insights working with Gemini
- Avatar visibly changes state with score
- Streak/coin/challenge logic works end-to-end
- Deployed to public URL accessible on phones
- Looks polished enough for NIFT submission
