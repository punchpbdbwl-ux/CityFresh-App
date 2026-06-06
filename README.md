# 🍎 CityFresh — Fruit Inventory Manager

A minimal, luxury-themed fruit inventory web app built for **CityFresh — Fruit Lovers' Community**.

---

## 📁 Project Structure

```
cityfresh/
├── index.html          ← Main entry point
├── css/
│   └── style.css       ← All styles (CI colours, layout, animations)
├── js/
│   ├── db.js           ← Mini database (localStorage)
│   ├── auth.js         ← Login, register, session, page transitions
│   └── app.js          ← Inventory table, CRUD, filtering
└── README.md
```

---

## 🚀 How to Run Locally

Just open `index.html` in any modern browser — no server or build step needed.

```bash
# Option A: Double-click index.html in your file manager

# Option B: Python quick-server (recommended)
cd cityfresh
python3 -m http.server 8080
# then open http://localhost:8080
```

---

## 🔑 Demo Account

| Email                  | Password        |
|------------------------|-----------------|
| demo@cityfresh.com     | cityfresh2025   |

Or create your own account via **Create account** on the login screen.

---

## 💾 Data Storage

All data is stored in your browser's **localStorage** — nothing is sent to any server.

| Key              | Contents                     |
|------------------|------------------------------|
| `cf_users`       | Registered accounts          |
| `cf_products`    | Full product inventory       |
| `cf_categories`  | Category list with colours   |
| `cf_session`     | Current login session        |

> **Note:** Data persists between page refreshes. Clearing browser data / localStorage will reset everything.

---

## 🌐 Free Hosting Options

### ⭐ Option 1 — GitHub Pages (Recommended, Free Forever)

1. Create a free account at [github.com](https://github.com)
2. Create a new **public** repository (e.g. `cityfresh-app`)
3. Upload all project files (drag & drop in the GitHub UI, or use Git):
   ```bash
   git init
   git add .
   git commit -m "Initial CityFresh deploy"
   git remote add origin https://github.com/YOUR_USERNAME/cityfresh-app.git
   git push -u origin main
   ```
4. Go to **Settings → Pages → Source → main branch / root**
5. Your app will be live at:
   `https://YOUR_USERNAME.github.io/cityfresh-app`

**Pros:** Free forever, custom domain support, version history  
**Cons:** Repository must be public (free tier)

---

### Option 2 — Netlify Drop (Fastest, No Account Needed)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire `cityfresh/` folder onto the page
3. Get a live URL instantly (e.g. `https://random-name-123.netlify.app`)
4. Optionally sign up to get a custom subdomain

**Pros:** Instant deploy, no Git needed, free SSL  
**Cons:** Random URL unless you sign up

---

### Option 3 — Vercel (Fast, Developer-Friendly)

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Click **New Project → Import Git Repository**
3. Select your `cityfresh-app` repo
4. Click **Deploy** (no config needed for static sites)
5. Live at `https://cityfresh-app.vercel.app`

**Pros:** Extremely fast CDN, preview deployments, great DX  
**Cons:** Requires GitHub account

---

### Option 4 — Cloudflare Pages (Best Performance)

1. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings: leave blank (static site)
4. Deploy → Live at `https://cityfresh-app.pages.dev`

**Pros:** Global CDN, unlimited bandwidth, free custom domain  
**Cons:** Requires GitHub

---

### Option 5 — Surge.sh (CLI, Super Simple)

```bash
npm install -g surge
cd cityfresh
surge
# Follow prompts → choose a domain like cityfresh.surge.sh
```

**Pros:** One command deploy, free custom `.surge.sh` subdomain  
**Cons:** Requires Node.js

---

## 🔒 Security Notes

- Passwords are hashed client-side (simple hash for demo purposes)
- For a production app, replace localStorage with a real backend (Firebase, Supabase, or a Node.js API)
- This app is suitable for internal team use or demo purposes

---

## 🎨 Brand Colors (CityFresh CI)

| Name       | Hex       |
|------------|-----------|
| Green      | `#8BAC4A` |
| Green Dark | `#6B8C2A` |
| Pink       | `#D4537E` |
| Yellow     | `#C8A832` |
| Teal       | `#0F6E56` |
| Orange     | `#E68755` |
| Purple     | `#7B5EA7` |
| Red        | `#C84040` |

---

Built with ❤️ for CityFresh — Fruit Lovers' Community
