import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { executeScraper, filterResults } from "@/lib/scraper-client";
import type { SearchQuery } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: SearchQuery = await request.json();
    const { query, filters } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Create search record in Supabase
    const { data: search, error: searchError } = await supabase
      .from("searches")
      .insert({
        query: query.trim(),
        filters,
        status: "pending",
      })
      .select()
      .single();

    if (searchError || !search) {
      console.error("Error creating search:", searchError);
      return NextResponse.json(
        { error: "Failed to create search" },
        { status: 500 }
      );
    }

    // Start scraping in the background
    const jobId = search.id;
    const outputPath = "temp";

    // Execute scraper asynchronously
    (async () => {
      try {
        // Update status to running
        await supabase
          .from("searches")
          .update({ status: "running" })
          .eq("id", jobId);

        // Run the scraper (now returns businesses directly)
        const allBusinesses = await executeScraper({ query: query.trim(), filters, outputPath });

        // Apply client-side filters
        const filteredBusinesses = filterResults(allBusinesses, filters);

        // Store results in Supabase
        if (filteredBusinesses.length > 0) {
          const resultsToInsert = filteredBusinesses.map((business) => ({
            search_id: jobId,
            business_name: business.title,
            phone: business.phone,
            address: business.complete_address,
            website: business.website,
            rating: business.review_rating,
            review_count: business.review_count,
            latitude: business.latitude,
            longitude: business.longitude,
            data: business,
          }));

          await supabase.from("results").insert(resultsToInsert);
        }

        // Update search status to completed
        await supabase
          .from("searches")
          .update({
            status: "completed",
            results_count: filteredBusinesses.length,
          })
          .eq("id", jobId);

        console.log(`Scraping completed for job ${jobId}. Found ${filteredBusinesses.length} results.`);
      } catch (error) {
        console.error("Error during scraping:", error);

        // Update search status to failed
        await supabase
          .from("searches")
          .update({
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", jobId);
      }
    })();

    // Return job ID immediately
    return NextResponse.json({ jobId, status: "pending" });
  } catch (error) {
    console.error("Error in scrape route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
