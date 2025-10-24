# Railway Deployment Guide

## Quick Deploy via Web Dashboard

Since the Railway CLI requires interactive input, the easiest way to deploy is through the web dashboard:

### Step 1: Push to GitHub

```bash
cd "/Users/echris/Desktop/Maps Scraper/maps-scraper-app"

# Create a new GitHub repository (if you haven't already)
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/maps-scraper-app.git
git push -u origin main
```

### Step 2: Deploy on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click on your **MapsScraper** project
3. Click **"New Service" → "GitHub Repo"**
4. Select your `maps-scraper-app` repository
5. Railway will auto-detect the Dockerfile and deploy

### Step 3: Set Environment Variables

In the Railway dashboard, add these environment variables to your service:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project settings: https://app.supabase.com

### Step 4: Generate Domain

1. Go to **Settings** tab in your service
2. Click **"Generate Domain"** under **Networking**
3. Your app will be live at `https://your-service.up.railway.app`

## Optimizations Applied

The Dockerfile has been optimized for Railway's free tier:

- ✅ **Multi-stage build** - Reduces final image size
- ✅ **System Chromium** - Avoids 170MB browser download
- ✅ **Reduced memory footprint** - 2GB Node heap instead of 4GB
- ✅ **Minimal logging** - Speeds up build process
- ✅ **Production mode** - Optimized runtime

## Build Time Estimate

With the optimized Dockerfile:
- **Dependencies**: ~2-3 minutes
- **Build**: ~3-5 minutes
- **Total**: ~6-8 minutes (should fit in free tier 10-minute limit)

## Troubleshooting

### Build Still Timing Out?

If the build times out even with optimizations:

1. **Upgrade to Hobby Plan** ($5/month)
   - No build time limits
   - More memory for builds
   - Better performance

2. **Use Vercel Instead** (free for Next.js)
   ```bash
   npm i -g vercel
   vercel
   ```
   Note: Vercel works great for Next.js but has limitations for long-running scraping tasks.

### Deployment Failing?

Check the logs in Railway dashboard:
- Go to **Deployments** tab
- Click on the failed deployment
- Check **Build Logs** and **Deploy Logs**

## Alternative: Manual CLI Deployment

If you prefer CLI and can handle interactive prompts:

```bash
# Link to project
railway init

# Link to service
railway service

# Deploy
railway up
```

## Need Help?

- Railway Docs: https://docs.railway.app
- Supabase Setup: https://supabase.com/docs/guides/getting-started
