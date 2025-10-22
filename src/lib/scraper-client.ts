import { chromium, type Browser, type Page } from "playwright-core";
import type { Business, SearchFilters } from "./types";

interface ScraperConfig {
  query: string;
  filters: SearchFilters;
  outputPath: string;
}

/**
 * Execute the Playwright scraper
 */
export async function executeScraper(config: ScraperConfig): Promise<Business[]> {
  const { query, filters } = config;

  let browser: Browser | null = null;

  try {
    console.log(`Starting scrape for: ${query}`);

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // Search Google Maps
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for results to load
    await page.waitForSelector('[role="feed"]', { timeout: 30000 });

    const businesses: Business[] = [];
    const maxResults = Math.min((filters.depth || 10) * 12, 500); // Approximate depth to results

    let scrollAttempts = 0;
    const maxScrollAttempts = filters.depth || 10;

    while (businesses.length < maxResults && scrollAttempts < maxScrollAttempts) {
      // Get all visible business cards
      const cards = await page.$$('[role="feed"] > div > div > a');

      console.log(`Found ${cards.length} cards on scroll ${scrollAttempts + 1}`);

      // Extract data from each card
      for (const card of cards) {
        try {
          const href = await card.getAttribute('href');
          if (!href) continue;

          // Skip if already processed
          if (businesses.some(b => b.cid === href)) continue;

          // Click to open details
          await card.click();
          await page.waitForTimeout(1500); // Wait for sidebar to load

          // Extract business data from sidebar
          const business = await extractBusinessData(page);
          if (business) {
            business.cid = href;
            businesses.push(business);
            console.log(`Scraped: ${business.title} (${businesses.length}/${maxResults})`);
          }

          if (businesses.length >= maxResults) break;
        } catch (error) {
          console.error('Error extracting business:', error);
          continue;
        }
      }

      // Scroll to load more results
      await page.evaluate(() => {
        const feed = document.querySelector('[role="feed"]');
        if (feed) {
          feed.scrollTo(0, feed.scrollHeight);
        }
      });

      await page.waitForTimeout(2000);
      scrollAttempts++;
    }

    console.log(`Scraping completed. Found ${businesses.length} businesses.`);

    return businesses;

  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Extract business data from Google Maps sidebar
 */
async function extractBusinessData(page: Page): Promise<Business | null> {
  try {
    // Title
    const title = await page.$eval('h1', el => el.textContent?.trim() || '').catch(() => '');

    if (!title) return null;

    // Rating and review count
    let review_rating = 0;
    let review_count = 0;
    try {
      const ratingText = await page.$eval('[role="img"][aria-label*="star"]', el => el.getAttribute('aria-label') || '');
      const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*stars?/i);
      if (ratingMatch) review_rating = parseFloat(ratingMatch[1]);

      const reviewText = await page.$eval('[role="img"][aria-label*="star"]', el => el.parentElement?.textContent || '');
      const reviewMatch = reviewText.match(/(\d+,?\d*)\s*reviews?/i);
      if (reviewMatch) review_count = parseInt(reviewMatch[1].replace(',', ''));
    } catch {}

    // Category
    let category = '';
    try {
      const buttons = await page.$$('button[jsaction]');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && !text.match(/\d/) && text.length < 50) {
          category = text.trim();
          break;
        }
      }
    } catch {}

    // Address
    let address = '';
    try {
      const addressButton = await page.$('[data-item-id="address"]');
      if (addressButton) {
        address = await addressButton.evaluate(el => el.textContent?.trim() || '');
      }
    } catch {}

    // Phone
    let phone = '';
    try {
      const phoneButton = await page.$('[data-item-id^="phone"]');
      if (phoneButton) {
        phone = await phoneButton.evaluate(el => el.textContent?.trim() || '');
      }
    } catch {}

    // Website
    let website = '';
    try {
      const websiteLink = await page.$('[data-item-id="authority"]');
      if (websiteLink) {
        website = await websiteLink.evaluate(el => el.getAttribute('href') || '');
      }
    } catch {}

    // Coordinates (from URL)
    let latitude = 0;
    let longitude = 0;
    try {
      const url = page.url();
      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        latitude = parseFloat(coordMatch[1]);
        longitude = parseFloat(coordMatch[2]);
      }
    } catch {}

    const business: Business = {
      id: `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      phone,
      website,
      email: '',
      address,
      complete_address: address,
      category,
      review_rating,
      review_count,
      latitude,
      longitude,
      cid: '',
      status: '',
      open_hours: '',
      popular_times: '',
      plus_code: '',
      reviews_per_rating: '',
      descriptions: '',
      reviews_link: '',
      thumbnail: '',
      timezone: '',
      price_range: '',
      data_id: '',
      images: '',
      reservations: '',
      order_online: '',
      menu: '',
      owner: '',
      about: '',
      user_reviews: '',
    };

    return business;
  } catch (error) {
    console.error('Error extracting business data:', error);
    return null;
  }
}

/**
 * Parse results (now returns directly from executeScraper)
 */
export async function parseResults(csvPath: string): Promise<Business[]> {
  // No longer needed - data is returned directly from executeScraper
  return [];
}

/**
 * Filter results based on search filters
 */
export function filterResults(businesses: Business[], filters: SearchFilters): Business[] {
  let filtered = [...businesses];

  // Filter by website status
  if (filters.noWebsite) {
    filtered = filtered.filter((b) => !b.website || b.website.trim() === "");
  }

  // Filter by minimum rating
  if (filters.minRating && filters.minRating > 0) {
    filtered = filtered.filter((b) => b.review_rating >= filters.minRating!);
  }

  // Filter by minimum reviews
  if (filters.minReviews && filters.minReviews > 0) {
    filtered = filtered.filter((b) => b.review_count >= filters.minReviews!);
  }

  return filtered;
}
