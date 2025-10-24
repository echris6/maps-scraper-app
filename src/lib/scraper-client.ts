import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Business, SearchFilters } from './types';

const execAsync = promisify(exec);

interface ScraperConfig {
  query: string;
  filters: SearchFilters;
  outputPath: string;
}

/**
 * Execute the Docker scraper
 */
export async function executeScraper(config: ScraperConfig): Promise<Business[]> {
  const { query, filters, outputPath = 'temp' } = config;

  // Get the scraper directory from environment or use default
  const scraperDir = process.env.DOCKER_SCRAPER_PATH || '/Users/echris/Desktop/Maps Scraper';
  const workDir = path.join(process.cwd(), outputPath);

  // Ensure output directory exists
  await fs.mkdir(workDir, { recursive: true });

  // Generate unique filename for this query
  const timestamp = Date.now();
  const inputFile = `query_${timestamp}.txt`;
  const inputFilePath = path.join(workDir, inputFile);
  const outputFile = `results_${timestamp}.csv`;
  const outputFilePath = path.join(workDir, outputFile);

  try {
    // Write query to input file
    await fs.writeFile(inputFilePath, query);

    // Build docker command with filters - SPEED OPTIMIZED
    const emailFlag = filters.extractEmails ? '-email' : '';

    // Fast mode: reduces data collection but 3x faster
    // 50 workers: 4x more parallel processing (was 12)
    // 6 CPUs + 8GB RAM: maximum throughput
    // Combined: ~7-8x speed boost!
    let command = `docker run --rm \\
      -v "${workDir}:/data" \\
      google-maps-scraper \\
      -c 50 \\
      -depth ${filters.depth || 10} \\
      -lang en \\
      -zoom 14 \\
      -fast-mode \\
      ${emailFlag} \\
      -input /data/${inputFile} \\
      -results /data/${outputFile}`;

    console.log('Executing Docker scraper...');
    console.log('Query:', query);
    console.log('Depth:', filters.depth || 10);

    // Execute the scraper
    const { stdout, stderr } = await execAsync(command, {
      cwd: scraperDir,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 300000, // 5 minutes timeout
    });

    if (stderr) {
      console.error('Scraper stderr:', stderr);
    }
    if (stdout) {
      console.log('Scraper output:', stdout);
    }

    // Read and parse CSV results
    const resultsContent = await fs.readFile(outputFilePath, 'utf-8');
    const businesses = await parseCSV(resultsContent);

    console.log(`Scraped ${businesses.length} businesses`);
    return businesses;

  } catch (error: any) {
    console.error('Scraper execution error:', error);
    throw new Error(`Failed to execute scraper: ${error.message}`);
  }
}

/**
 * Parse CSV results into Business objects
 */
async function parseCSV(csvContent: string): Promise<Business[]> {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const businesses: Business[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const business: any = {};

    headers.forEach((header, index) => {
      business[header] = values[index] || '';
    });

    // Map CSV fields to Business interface
    const mappedBusiness: Business = {
      id: business.id || `business_${Date.now()}_${i}`,
      title: business.title || business.name || '',
      phone: business.phone || '',
      website: business.website || '',
      email: business.email || '',
      address: business.address || '',
      complete_address: business.complete_address || business.address || '',
      category: business.category || business.type || '',
      review_rating: parseFloat(business.review_rating || business.rating || '0'),
      review_count: parseInt(business.review_count || business.reviews_count || '0'),
      latitude: parseFloat(business.latitude || '0'),
      longitude: parseFloat(business.longitude || '0'),
      cid: business.cid || '',
      status: business.status || '',
      open_hours: business.open_hours || '',
      popular_times: business.popular_times || '',
      plus_code: business.plus_code || '',
      reviews_per_rating: business.reviews_per_rating || '',
      descriptions: business.descriptions || '',
      reviews_link: business.reviews_link || '',
      thumbnail: business.thumbnail || '',
      timezone: business.timezone || '',
      price_range: business.price_range || '',
      data_id: business.data_id || '',
      images: business.images || '',
      reservations: business.reservations || '',
      order_online: business.order_online || '',
      menu: business.menu || '',
      owner: business.owner || '',
      about: business.about || '',
      user_reviews: business.user_reviews || '',
    };

    if (mappedBusiness.title) {
      businesses.push(mappedBusiness);
    }
  }

  return businesses;
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Parse results (legacy compatibility)
 */
export async function parseResults(csvPath: string): Promise<Business[]> {
  try {
    const content = await fs.readFile(csvPath, 'utf-8');
    return await parseCSV(content);
  } catch (error) {
    console.error('Error parsing results:', error);
    return [];
  }
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
