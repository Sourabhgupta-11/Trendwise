# TrendWise — AI-Powered Trending News Platform

> Discover what India is talking about today. Real trending topics, AI-written articles, refreshed every day — automatically.

🔗 **Live:** [trendwise-swart.vercel.app](https://trendwise-swart.vercel.app)

---

## What It Does

TrendWise is a fully automated news platform that:
1. **Fetches real trending topics** from Google Trends India every day
2. **Generates full articles** for each topic using the Gemini AI API
3. **Attaches relevant media** — images from Unsplash and videos from YouTube
4. **Publishes everything automatically** — no human editing, no manual posting

Users sign in with Google, browse AI-written articles across categories, and leave comments. Old articles are auto-deleted after 7 days to keep content fresh.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React · Bootstrap 5 |
| Backend | Node.js · Express |
| Database | MongoDB Atlas · Mongoose |
| AI | Google Gemini 2.5 Flash API |
| Trends | Google Trends API (real-time, India) |
| Media | Unsplash API · YouTube Data API v3 |
| Auth | Google OAuth 2.0 · Passport.js · express-session |
| Deploy | Vercel (frontend) · Render (backend) |
| Scheduler | node-cron + cron-job.org (external trigger) |

---

## Key Features

- **Fully automated pipeline** — trends → AI article → image + video → published, daily
- **Real trending data** — pulls from Google Trends India, not guesses
- **6 content categories** — Tech, Sports, Politics, Entertainment, Business, Education
- **Google OAuth** — one-click sign in, no passwords
- **Comments system** — logged-in users can comment on any article
- **Admin dashboard** — manage articles and users
- **Auto-cleanup** — articles older than 7 days are deleted before each run
- **SEO-ready** — dynamic meta titles and descriptions per article

---

## Architecture

```
cron-job.org (daily trigger)
       ↓
  Express /api/trigger-bot
       ↓
  Google Trends API → 10-12 real trending topics
       ↓ (parallel)
  Unsplash API  ←→  YouTube API   (media per topic)
       ↓
  Gemini 2.5 Flash → full HTML article
       ↓
  MongoDB Atlas (save with category tag)
       ↓
  React Frontend → fetches & displays articles
```

---

## Running Locally

```bash
# Backend
cd Backend
npm install
# .env: MONGODB_URL, GEMINI_API_KEY, UNSPLASH_ACCESS_KEY,
#        YOUTUBE_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
#        SESSION_SECRET, CRON_SECRET
node server.js

# Frontend
cd frontend
npm install
# .env: REACT_APP_API_URL=http://localhost:5050
npm start
```

To run the bot manually:
```bash
cd Backend
node bot/contentBot.js
```

---

## How the Bot Works

```
1. Google Trends India  →  fetch today's top trending searches
2. For each trend:
     - Unsplash          →  relevant cover image
     - YouTube           →  related video embed
     - Gemini 2.5 Flash  →  full HTML article (600-800 words)
     - assignCategory()  →  keyword-match to Tech/Sports/Politics/etc.
3. Save to MongoDB (skip duplicates by slug)
4. Auto-delete articles older than 7 days
```

---

*Built to demonstrate full-stack automation — real-time data pipelines, AI content generation, OAuth authentication, and scheduled background jobs in production.*
