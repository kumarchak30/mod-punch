# ModPunch

**Live site: [ModPunchMC.com](https://www.modpunchmc.com)**

ModPunch is a beginner-friendly Minecraft mod browser. Pick your Minecraft version and browse the most popular mods for it, filtered by simple categories. Mod data comes from the [Modrinth API](https://docs.modrinth.com/).

| Member | GitHub |
|---|---|
| Natalie Ortiz | [@natgiselle](https://github.com/natgiselle) |
| Kumar Chakraborty | [@kumarchak30](https://github.com/kumarchak30) |
| Joseph Fuentes | [@LowkeyJosephF](https://github.com/LowkeyJosephF) |

## Data structures (implemented from scratch)

| Structure | File | Used for |
|---|---|---|
| **B+ tree** | `src/data_structures/BPlusTree.js` | Homepage: mods sorted by version, then downloads. Each page of results is one `rangeScan`. |
| **Splay tree** | `src/data_structures/SplayTree.js` | Profile page: recent searches and saved mods. Recently used items move to the root. |

## Features

- Version picker (click or type, e.g. `1.20.1`)
- Category filters (Optimization, Utility, Adventure, …)
- Mod cards sorted by downloads, with **Load more**
- Sign up / sign in (Supabase), with the chosen version saved to your account
- Profile page with PC specs, recent searches and saved mods. Recent searches and saved mods use the splay tree and are saved per account in your browser (they don't sync between browsers or devices yet).

## Art

The ModPunch logo and favicon are original pixel art by [Natalie Ortiz](https://github.com/natgiselle), made in [Piskel](https://www.piskelapp.com/).

## Coming soon

- Browse mods without an account (sign in only to save your version and profile)
- Pixel-art covers on mod cards
- Search with autocomplete
- Sync recent searches and saved mods to your account, so they follow you across devices

## Running locally

### Requirements
- [Node.js](https://nodejs.org/) 20 or newer
- A [Supabase](https://supabase.com/) project (free tier is fine) for sign-in

### 1. Install
```bash
git clone https://github.com/kumarchak30/mod-punch.git
cd mod-punch
npm install
```

### 2. Add Supabase keys
Create a file named `.env` in the project root:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```
Both values are in your Supabase dashboard under **Project Settings → API**. Use the **publishable** key, never the secret / service_role key.

### 3. Start the app
```bash
npm run dev
```
Open the link it prints (usually `http://localhost:5173`), create an account, and you'll land on the mod browser.

`public/mods-lite.json` (the top 5,000 mods) is already in the repo, so no extra data step is needed to run the app.

## Rebuilding the mod data (optional)

The full dataset is not in the repo (about 37 MB). To download it again from Modrinth:
```bash
node scripts/build-mod-index.mjs          # writes data/mods.jsonl (takes a while)
node scripts/build-browser-data.mjs       # writes public/mods-lite.json for the app
```
To try it quickly with only a few pages: `MAX_PAGES=3 node scripts/build-mod-index.mjs`

## Tests and benchmark

```bash
node scripts/test-splaytree.mjs     # splay tree tests
node scripts/test-bplustree.mjs     # B+ tree tests (needs data/mods.jsonl)
node scripts/benchmark.mjs          # B+ tree vs Map vs array scan (needs data/mods.jsonl, ~40 s)
```

## Project structure

```
scripts/                 data download, tests, benchmark
src/data_structures/     BPlusTree.js, SplayTree.js, compareModVersion.js
src/services/            modQueries.js — builds the B+ tree and answers homepage queries
src/pages/               HomePage.jsx
src/components/home/     TopBar, VersionPicker, CategoryChips, ModGrid, ModCard
src/components/          Sign in / sign up / onboarding / profile pages
src/hooks/               useSplayHistory.js — splay tree for the profile page
```

## Tech stack

React, Vite, JavaScript, Supabase (auth), Vercel (hosting), Modrinth API (mod data).

*ModPunch is not affiliated with Mojang or Microsoft.*