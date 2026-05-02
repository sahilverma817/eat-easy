# Eat Easy

A gamified healthy-eating web app for Indian students and young adults.
NIFT Fashion Communication 4th-semester project.

> Eat better than yesterday. That's the only goal.

## What it does

- Log everyday Indian meals (poha, dal-chawal, dosa, biryani, chai, Maggi…)
- A simple habit score nudges your daily energy up or down
- Your avatar visibly evolves: tired → steady → active → glowing
- Streaks, daily challenges, coins, unlockable accessories and outfits
- Add real friends by username, see their progress, send nudges
- AI insight after every meal (Gemini), with a friendly tweak suggestion
- Share your daily progress card to WhatsApp/Insta

## Tech

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS v4
- framer-motion for animations
- Upstash Redis for all persistent data
- Google Gemini for meal insights
- jose for session JWTs, bcryptjs for PIN hashing
- html-to-image for share cards
- Free deploy on Vercel

---

## Deploy in 10 minutes (zero cost)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Eat Easy v1"
gh repo create eat-easy --public --source=. --push
```

(or upload via github.com/new)

### Step 2 — Get a free Gemini API key

1. Go to <https://aistudio.google.com/apikey>
2. Sign in with any Google account
3. Click **Create API key** → copy it. Free tier is generous (15 req/min, 1M tokens/day).

### Step 3 — Generate a session secret

```bash
openssl rand -hex 32
```

Copy the long hex string.

### Step 4 — Deploy on Vercel

1. Go to <https://vercel.com/new>
2. Sign in with GitHub
3. Import the `eat-easy` repository
4. Click **Deploy** (no env vars needed yet — first deploy will succeed but app won't work until Redis is added)

### Step 5 — Add Upstash Redis (free, integrated)

1. In your Vercel project → **Storage** tab → **Create Database**
2. Pick **Upstash for Redis** (Marketplace) → free plan → **Create**
3. It auto-connects to your project. The env vars `KV_REST_API_URL` and `KV_REST_API_TOKEN` are injected automatically.

### Step 6 — Add the other env vars

In Vercel project → **Settings** → **Environment Variables**, add:

| Key | Value |
| --- | --- |
| `GEMINI_API_KEY` | (from Step 2) |
| `SESSION_SECRET` | (from Step 3) |

### Step 7 — Redeploy

In **Deployments** → click the latest deployment → **Redeploy**.

Done. The URL `your-project.vercel.app` is now live. Share with 5–6 friends.

---

## Local development

```bash
npm install
cp .env.example .env.local
# fill in KV_REST_API_URL, KV_REST_API_TOKEN (use Upstash console or Vercel CLI),
# GEMINI_API_KEY, SESSION_SECRET
npm run dev
```

Open <http://localhost:3000>.

If you skip `KV_*` env vars, the landing/auth pages still render but anything else will 500.

---

## Project structure

```
src/
  app/                 # Next.js App Router pages + API routes
    page.tsx           # /
    auth/              # /auth (login + signup)
    onboarding/        # /onboarding (5-step quiz)
    dashboard/         # /dashboard (home)
    log/               # /log (meal logging flow)
    avatar/            # /avatar (avatar room + shop)
    challenges/        # /challenges
    friends/           # /friends
    api/               # all server routes
  components/          # Avatar, BottomNav, ScoreRing, Toast, AppShell
  lib/                 # types, foods, challenges, scoring, redis, session, api
docs/superpowers/specs/ # design doc
public/                # icons, manifest
```

## How the data flows

- **All persistent data lives in Upstash Redis** under three keys:
  - `user:{username}` — full user blob (profile, meals, score, streak, coins, friends, etc.)
  - `session:{sid}` — maps a session ID to a username (TTL 30d)
  - `nudge-inbox:{username}` — queue of incoming nudges
- The browser stores nothing except an HttpOnly session cookie.
- All writes go through the API routes — no direct client → DB access.

## How the score works

Daily score starts at 50, capped at 0–100.

- Each meal: `food.baseScore × portionMult + addOnDelta` (varies from −20 to +20)
- Each glass of water: +2 (max 8 = +16)
- Daily challenge done: +20
- Skipped breakfast (no breakfast logged by 11am): −8
- Late-night meal (logged after 11pm): −5

Avatar state derives from score:
- 0–30 tired · 31–60 steady · 61–80 active · 81–100 glowing

Streak rules: log at least 2 meals → streak +1 next day. Miss a day → reset.

## Gemini integration

`/api/insight` receives the food + portion + add-ons + meal-type + day-context + user goal, asks Gemini for 2 short sentences of practical Indian-coded advice, and returns the text.

If Gemini fails or isn't configured, falls back to a hand-written feedback template per food.

## Friends

- Add by username → request goes into target's inbox
- Target accepts → mutual friendship
- Friend list shows live data: today's score, streak, avatar state
- Nudge: pick a preset message, target sees a toast on their next page load
- Share card: PNG download with avatar + stats, share manually

No DMs, no public feed, no leaderboards.

## What's intentionally not built

- Real-time chat
- Push notifications
- Photo / image upload
- Calorie / macro tracking
- AI-generated diet plans
- Public leaderboards
- OAuth / email login (just username + 4-digit PIN)
- Password reset
