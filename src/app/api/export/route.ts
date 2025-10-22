import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ExportFormat } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { jobId, format } = await request.json() as { jobId: string; format: ExportFormat };

    if (!jobId || !format) {
      return NextResponse.json(
        { error: "Job ID and format are required" },
        { status: 400 }
      );
    }

    // Get results from Supabase
    const { data: results, error } = await supabase
      .from("results")
      .select("*")
      .eq("search_id", jobId);

    if (error || !results) {
      return NextResponse.json(
        { error: "Failed to fetch results" },
        { status: 500 }
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No results found" },
        { status: 404 }
      );
    }

    const businesses = results.map((r) => r.data);

    // Format data based on requested format
    let content: string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case "csv":
        content = exportToCSV(businesses);
        contentType = "text/csv";
        filename = `google-maps-results-${jobId}.csv`;
        break;

      case "json":
        content = JSON.stringify(businesses, null, 2);
        contentType = "application/json";
        filename = `google-maps-results-${jobId}.json`;
        break;

      case "xlsx":
        // For XLSX, we'd need a library like xlsx
        // For MVP, return error or fall back to CSV
        return NextResponse.json(
          { error: "XLSX export not yet implemented. Use CSV or JSON." },
          { status: 501 }
        );

      default:
        return NextResponse.json(
          { error: "Invalid format" },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function exportToCSV(businesses: any[]): string {
  if (businesses.length === 0) return "";

  // Get headers from first business
  const headers = [
    "title",
    "phone",
    "email",
    "website",
    "address",
    "category",
    "rating",
    "review_count",
    "latitude",
    "longitude",
  ];

  // Create CSV
  const csvRows = [headers.join(",")];

  for (const business of businesses) {
    const values = headers.map((header) => {
      const value = business[header === "rating" ? "review_rating" : header] || "";
      // Escape commas and quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
