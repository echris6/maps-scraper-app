# 🗺️ Google Maps Scraper Web App

A modern, production-ready web application for extracting business data from Google Maps. Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- 🎨 **Beautiful UI** - Modern, responsive design with dark/light mode
- ⚡ **Real-time Progress** - Live updates while scraping
- 🎯 **Advanced Filters** - Filter by website status, ratings, reviews, and more
- 📊 **Multiple Views** - Grid, list, and table views for results
- 💾 **Export Options** - Download as CSV or JSON
- 🔄 **Persistent History** - All searches saved to Supabase
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎭 **Smooth Animations** - Powered by Framer Motion

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - App Router, Server Components
- **TypeScript** - Strict mode, type-safe
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation
- **TanStack Query** - Data fetching & caching

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - PostgreSQL database
- **Docker** - Scraper execution

### State Management
- **Zustand** - Lightweight global state
- **React Query** - Async state management

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **Docker Desktop** running (for the scraper)
- **Supabase account** (free tier works)
- **Google Maps Scraper** set up at `/Users/echris/Desktop/Maps Scraper`

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/echris/Desktop/Maps\ Scraper/maps-scraper-app
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to be ready

#### Run the Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the SQL script
5. Verify tables `searches` and `results` are created

### 3. Configure Environment Variables

Create a `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Scraper Configuration
DOCKER_SCRAPER_PATH=/Users/echris/Desktop/Maps Scraper
SCRAPER_API_URL=http://localhost:8080
```

**Getting Supabase Credentials:**
1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy the **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
3. Copy the **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 4. Verify Docker Scraper

Ensure the Google Maps scraper is set up and Docker is running:

```bash
docker --version
docker pull gosom/google-maps-scraper
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### 1. Home Page

- Beautiful landing page with hero section
- Click example searches or enter your own query
- Click "Start Scraping" to begin

### 2. Search Interface

**Basic Search:**
1. Enter a query like "pet grooming amsterdam"
2. Click "Start Scraping"

**Advanced Filters:**
- **No Website Only** - Filter businesses without websites
- **Minimum Rating** - Set minimum star rating (0-5)
- **Minimum Reviews** - Set minimum review count
- **Search Depth** - Higher depth = more results (slower)
  - Depth 1: ~12 results (fast)
  - Depth 10: ~120 results (balanced)
  - Depth 20: ~240 results (slow)
- **Extract Emails** - Visit websites to extract emails (much slower)

### 3. Results Page

**While Scraping:**
- Real-time progress bar
- Live result counter
- Results appear as they're found

**After Scraping:**
- Switch between grid/list views
- Click business cards to see details
- Export results as CSV or JSON

**Business Card Information:**
- Business name (links to Google Maps)
- Category and rating
- Phone number (click-to-call on mobile)
- Address
- Website status
- Email (if extracted)

### 4. Export Results

1. Click the "Export" button
2. Choose format:
   - **CSV** - For Excel, Google Sheets
   - **JSON** - For developers, APIs

## 🏗️ Project Structure

```
maps-scraper-app/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Landing page
│   │   ├── search/               # Search interface
│   │   ├── results/[id]/         # Results page
│   │   └── api/                  # API routes
│   │       ├── scrape/           # Start scraping
│   │       ├── jobs/[id]/        # Get job status
│   │       └── export/           # Export results
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── landing/              # Landing page components
│   │   ├── search/               # Search components
│   │   ├── results/              # Results components
│   │   ├── layout/               # Layout components
│   │   ├── providers/            # React Query provider
│   │   └── theme-provider.tsx   # Dark mode provider
│   ├── lib/
│   │   ├── types.ts              # TypeScript types
│   │   ├── supabase.ts           # Supabase client
│   │   ├── scraper-client.ts     # Scraper integration
│   │   └── utils.ts              # Utilities
│   └── hooks/                    # Custom hooks
├── supabase/
│   └── schema.sql                # Database schema
├── .env.local                    # Environment variables
└── README.md                     # This file
```

## 🔧 Configuration

### Scraper Settings

Edit `DOCKER_SCRAPER_PATH` in `.env.local` to point to your scraper directory.

### Supabase Settings

The app uses Supabase for:
- Storing search history
- Caching results
- Real-time progress updates

### Performance Tuning

**Depth Settings:**
- Lower depth = faster, fewer results
- Higher depth = slower, more results
- Recommended: Start with depth 10

**Email Extraction:**
- Visits each business website
- Significantly slower (2-3x)
- Only enable if you need emails

## 📊 Database Schema

### `searches` Table
```sql
- id (UUID, primary key)
- query (TEXT)
- filters (JSONB)
- status (TEXT: pending, running, completed, failed)
- created_at (TIMESTAMPTZ)
- completed_at (TIMESTAMPTZ)
- results_count (INTEGER)
- error (TEXT, nullable)
```

### `results` Table
```sql
- id (UUID, primary key)
- search_id (UUID, foreign key)
- business_name (TEXT)
- phone (TEXT)
- address (TEXT)
- website (TEXT)
- rating (NUMERIC)
- review_count (INTEGER)
- latitude (NUMERIC)
- longitude (NUMERIC)
- data (JSONB, full business object)
- created_at (TIMESTAMPTZ)
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `DOCKER_SCRAPER_PATH` (for Railway scraper)
     - `SCRAPER_API_URL` (if using deployed scraper)
   - Deploy!

3. **Deploy Scraper (Optional):**

   The scraper needs to run somewhere with Docker. Options:

   **Option A: Keep it local**
   - Run scraper on your Mac
   - Use ngrok tunnel for development
   - Not recommended for production

   **Option B: Deploy to Railway**
   - Create Dockerfile for scraper
   - Deploy to Railway ($5/month)
   - Update `SCRAPER_API_URL` in Vercel

## 🐛 Troubleshooting

### Common Issues

**"Failed to create search"**
- Check Supabase credentials in `.env.local`
- Verify database tables exist
- Check Supabase logs

**"Docker is not running"**
- Ensure Docker Desktop is running
- Verify: `docker ps`

**"No results found"**
- Check query works on Google Maps directly
- Try increasing search depth
- Wait full 3+ minutes (minimum runtime)

**Build errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run build`

### Logs

**View Next.js logs:**
```bash
npm run dev
```

**View Supabase logs:**
- Go to Supabase dashboard → Logs

**Check Docker scraper:**
```bash
docker logs <container-id>
```

## 📝 API Routes

### POST `/api/scrape`
Start a new scraping job

**Request:**
```json
{
  "query": "pet grooming amsterdam",
  "filters": {
    "noWebsite": true,
    "minRating": 4.0,
    "minReviews": 10,
    "depth": 10,
    "extractEmails": false
  }
}
```

**Response:**
```json
{
  "jobId": "uuid",
  "status": "pending"
}
```

### GET `/api/jobs/[id]`
Get job status and results

**Response:**
```json
{
  "id": "uuid",
  "query": "pet grooming amsterdam",
  "status": "completed",
  "progress": 100,
  "resultsCount": 45,
  "results": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:05:00Z"
}
```

### POST `/api/export`
Export results

**Request:**
```json
{
  "jobId": "uuid",
  "format": "csv"
}
```

**Response:**
File download

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [gosom/google-maps-scraper](https://github.com/gosom/google-maps-scraper) - The amazing scraper this app is built on
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Vercel](https://vercel.com) - Hosting platform

## 📞 Support

For issues or questions:
- Check this README
- Review [gosom/google-maps-scraper docs](https://github.com/gosom/google-maps-scraper)
- Open an issue on GitHub

---

**Made with ❤️ using Next.js 14, TypeScript, and shadcn/ui**
