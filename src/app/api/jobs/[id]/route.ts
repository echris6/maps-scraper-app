import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get search record
    const { data: search, error: searchError } = await supabase
      .from("searches")
      .select("*")
      .eq("id", id)
      .single();

    if (searchError || !search) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Get results
    const { data: results, error: resultsError } = await supabase
      .from("results")
      .select("*")
      .eq("search_id", id)
      .order("created_at", { ascending: false });

    if (resultsError) {
      console.error("Error fetching results:", resultsError);
    }

    // Calculate progress (rough estimate)
    let progress = 0;
    if (search.status === "pending") progress = 0;
    else if (search.status === "running") progress = 50;
    else if (search.status === "completed") progress = 100;
    else if (search.status === "failed") progress = 0;

    // Get results count (from database or search record)
    const resultsCount = results?.length || search.results_count || 0;

    return NextResponse.json({
      id: search.id,
      query: search.query,
      filters: search.filters,
      status: search.status,
      progress,
      resultsCount,
      results: results || [],
      error: search.error,
      createdAt: search.created_at,
      completedAt: search.completed_at,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
