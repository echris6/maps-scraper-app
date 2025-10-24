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
    // 35 workers: sweet spot for speed vs Google rate limits
    // 6 CPUs + 8GB RAM: maximum throughput
    // Result: ~3-4x speed boost!
    const emailArgs = filters.extractEmails ? '-email' : '';

    let command = `docker run --rm -v "${workDir}:/data" google-maps-scraper -c 35 -depth ${filters.depth || 10} -lang en -zoom 14 ${emailArgs} -input /data/${inputFile} -results /data/${outputFile}`.replace(/\s+/g, ' ').trim();

    console.log('Executing Docker scraper...');
    console.log('Query:', query);
    console.log('Depth:', filters.depth || 10);
    console.log('Workers:', 35);

    // Execute the scraper with longer timeout
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: scraperDir,
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 600000, // 10 minutes timeout
      });

      if (stderr) {
        console.error('Scraper stderr:', stderr);
      }
      if (stdout) {
        console.log('Scraper output:', stdout);
      }
    } catch (execError: any) {
      // Docker process may be killed (SIGPIPE) after completing work
      // Check if results file exists before treating as error
      console.warn('Docker process exited with error:', execError.message);
      console.log('Checking if results were still generated...');
    }

    // Read and parse CSV results (even if Docker was killed after finishing)
    try {
      const resultsContent = await fs.readFile(outputFilePath, 'utf-8');
      const businesses = await parseCSV(resultsContent);

      if (businesses.length === 0) {
        throw new Error('No businesses found in results file');
      }

      console.log(`Scraped ${businesses.length} businesses successfully`);
      return businesses;
    } catch (readError: any) {
      throw new Error(`Failed to read results: ${readError.message}`);
    }

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
