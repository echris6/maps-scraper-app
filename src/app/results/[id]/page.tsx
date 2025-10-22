"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { ProgressBar } from "@/components/results/progress-bar"
import { BusinessCard } from "@/components/results/business-card"
import { BusinessCardSkeleton } from "@/components/results/business-card-skeleton"
import { ExportButton } from "@/components/results/export-button"
import type { Business, JobStatus } from "@/lib/types"

interface JobData {
  id: string
  query: string
  status: JobStatus
  progress: number
  resultsCount: number
  results: Array<{ data: Business }>
  error?: string
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  // Poll for job status and results
  const { data: job, isLoading } = useQuery<JobData>({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${id}`)
      if (!res.ok) throw new Error("Failed to fetch job")
      return res.json()
    },
    refetchInterval: (query) => {
      const data = query.state.data
      // Poll every 2 seconds while running, stop when completed/failed
      return data?.status === "running" || data?.status === "pending" ? 2000 : false
    },
  })

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-12">
        <div className="mb-8 text-center">
          <div className="h-9 bg-gray-100 rounded w-32 mb-2 mx-auto" />
          <div className="h-5 bg-gray-100 rounded w-64 mb-6 mx-auto" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <BusinessCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="container max-w-3xl py-20">
        <div className="text-center">
          <p className="text-base text-muted-foreground">Job not found</p>
        </div>
      </div>
    )
  }

  const businesses = job.results.map((r) => r.data)

  return (
    <div className="container max-w-3xl py-12">
      {/* Header - Centered */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">Results</h1>
        <p className="text-sm text-muted-foreground">
          {job.query}
        </p>
      </div>

      {/* Progress - Centered */}
      {(job.status === "running" || job.status === "pending") && (
        <div className="mb-8">
          <ProgressBar progress={job.progress} resultsCount={job.resultsCount} />
        </div>
      )}

      {/* Actions Bar - Centered */}
      {job.status === "completed" && businesses.length > 0 && (
        <div className="flex items-center justify-between py-4 px-5 border rounded-lg bg-white mb-6">
          <p className="text-sm text-muted-foreground">
            {job.resultsCount} result{job.resultsCount !== 1 ? "s" : ""}
          </p>
          <ExportButton jobId={id} />
        </div>
      )}

      {/* Error State - Centered */}
      {job.status === "failed" && (
        <div className="border rounded-lg p-12 bg-white text-center">
          <p className="text-base font-medium mb-2">Scraping Failed</p>
          <p className="text-sm text-muted-foreground">
            {job.error?.includes("Command failed")
              ? "Unable to complete scraping. Please try again."
              : job.error || "An unknown error occurred"}
          </p>
        </div>
      )}

      {/* Empty Results - Centered */}
      {job.status === "completed" && businesses.length === 0 && (
        <div className="border rounded-lg p-12 bg-white text-center">
          <p className="text-base font-medium mb-2">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search query or filters
          </p>
        </div>
      )}

      {/* Results */}
      {businesses.length > 0 && (
        <div className="space-y-3">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  )
}
