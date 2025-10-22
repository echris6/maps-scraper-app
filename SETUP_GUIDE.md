# 🚀 Quick Setup Guide

Follow these steps to get your Google Maps Scraper web app running in **10 minutes**.

## ✅ Step-by-Step Setup

### Step 1: Install Docker (if not already done)

If you haven't installed Docker yet, follow these instructions from the main Maps Scraper folder:

```bash
cd "/Users/echris/Desktop/Maps Scraper"
./INSTALL_DOCKER_NOW.sh
```

Or install manually from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

Verify Docker is running:
```bash
docker --version
docker ps
```

### Step 2: Set Up Supabase (5 minutes)

1. **Create account:**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for free

2. **Create new project:**
   - Click "New Project"
   - Give it a name (e.g., "maps-scraper")
   - Set a database password (save it!)
   - Choose a region
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Run database schema:**
   - In Supabase dashboard, click "SQL Editor" in sidebar
   - Click "New Query"
   - Open `supabase/schema.sql` in your code editor
   - Copy the entire SQL script
   - Paste into Supabase SQL editor
   - Click "Run"
   - You should see "Success. No rows returned"

4. **Get API credentials:**
   - Click "Project Settings" (gear icon in sidebar)
   - Click "API" tab
   - Copy these two values:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Configure Environment Variables (2 minutes)

1. **Copy the example file:**
   ```bash
   cd "/Users/echris/Desktop/Maps Scraper/maps-scraper-app"
   cp .env.example .env.local
   ```

2. **Edit `.env.local`:**
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co    # Paste your Project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here           # Paste your anon key

   # Scraper Configuration (already correct)
   DOCKER_SCRAPER_PATH=/Users/echris/Desktop/Maps Scraper
   SCRAPER_API_URL=http://localhost:8080
   ```

3. **Save the file**

### Step 4: Install Dependencies (2 minutes)

```bash
cd "/Users/echris/Desktop/Maps Scraper/maps-scraper-app"
npm install
```

This installs all required packages (~500 packages, takes 1-2 minutes).

### Step 5: Start the Development Server (1 minute)

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - ready in X ms
```

### Step 6: Test the App! (2 minutes)

1. **Open browser:**
   - Go to [http://localhost:3000](http://localhost:3000)
   - You should see the beautiful landing page!

2. **Try a search:**
   - Click "Start Scraping" or go to the search page
   - Enter a query like "cafe in athens"
   - Set filters (try "No Website Only")
   - Click "Start Scraping"
   - Watch the real-time progress!

## 🎉 You're Done!

Your app is now running. You can:

- ✅ Search for businesses
- ✅ Apply advanced filters
- ✅ View real-time scraping progress
- ✅ Export results to CSV or JSON
- ✅ Switch between light/dark mode

## 🔧 Next Steps

### Customize the App

- Edit components in `src/components/`
- Modify styles in `src/app/globals.css`
- Add new features in `src/app/`

### Deploy to Production

See [README.md](README.md) for deployment instructions to Vercel.

### Need Help?

- Check [README.md](README.md) for full documentation
- Review [Troubleshooting section](README.md#-troubleshooting)
- Check Supabase logs if searches aren't saving

## 🐛 Quick Troubleshooting

**App won't start:**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Supabase errors:**
- Verify credentials in `.env.local`
- Check tables exist in Supabase dashboard
- Ensure project is not paused (free tier pauses after 1 week inactive)

**Docker errors:**
- Ensure Docker Desktop is running
- Pull the scraper image: `docker pull gosom/google-maps-scraper`

**Build errors:**
```bash
npm run build
```
Check the error messages and fix TypeScript/ESLint issues.

## 📊 What Each File Does

```
maps-scraper-app/
├── src/app/
│   ├── page.tsx              → Landing page (what you see first)
│   ├── search/page.tsx       → Search interface
│   ├── results/[id]/page.tsx → Results display
│   └── api/                  → Backend API routes
│       ├── scrape/route.ts   → Starts scraping
│       ├── jobs/[id]/route.ts → Gets results
│       └── export/route.ts   → Downloads CSV/JSON
│
├── src/components/
│   ├── ui/                   → UI components (buttons, cards, etc.)
│   ├── landing/              → Landing page sections
│   ├── search/               → Search form & filters
│   ├── results/              → Results cards & export
│   └── layout/               → Navbar, footer, theme toggle
│
├── src/lib/
│   ├── supabase.ts          → Database connection
│   ├── scraper-client.ts    → Docker scraper integration
│   └── types.ts             → TypeScript types
│
├── supabase/
│   └── schema.sql           → Database tables
│
└── .env.local               → Your configuration (SECRET!)
```

## 🎨 Customization Tips

### Change Colors

Edit `src/app/globals.css`:
```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Blue by default */
}
```

### Change Logo

Edit `src/components/layout/navbar.tsx`:
```tsx
<Map className="h-6 w-6 text-primary" />  ← Change this icon
```

### Add New Filters

Edit `src/components/search/filter-panel.tsx` and add your filter UI.

### Modify Export Formats

Edit `src/app/api/export/route.ts` to add new export formats.

## 🔐 Security Notes

- **NEVER commit `.env.local`** to Git
- Keep your Supabase keys secret
- The app is single-user by default
- For multi-user, add authentication (Clerk/NextAuth)

---

**Ready to scrape? Start the dev server and enjoy! 🎉**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start finding businesses!
