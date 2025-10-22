"use client"

import { Search, ChevronDown, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BusinessCard } from "@/components/results/business-card"
import { BusinessCardSkeleton } from "@/components/results/business-card-skeleton"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
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

type ViewState = "search" | "loading" | "results" | "error"

export function HeroSection() {
  const [query, setQuery] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [depth, setDepth] = useState(10)
  const [noWebsite, setNoWebsite] = useState(false)
  const [extractEmails, setExtractEmails] = useState(false)

  const [viewState, setViewState] = useState<ViewState>("search")
  const [jobId, setJobId] = useState<string | null>(null)

  // Poll for job status
  const { data: job } = useQuery<JobData>({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) throw new Error("Failed to fetch job")
      return res.json()
    },
    enabled: !!jobId && (viewState === "loading" || viewState === "results"),
    refetchInterval: (query) => {
      const data = query.state.data
      return data?.status === "running" || data?.status === "pending" ? 2000 : false
    },
  })

  // Update view state based on job status
  useEffect(() => {
    if (job && viewState === "loading") {
      if (job.status === "completed") {
        setViewState("results")
      } else if (job.status === "failed") {
        setViewState("error")
      }
    }
  }, [job, viewState])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    try {
      setViewState("loading")

      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          filters: {
            noWebsite,
            minRating: 0,
            minReviews: 0,
            depth,
            extractEmails,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to start scraping")
      }

      const { jobId: newJobId } = await response.json()
      setJobId(newJobId)
    } catch (error) {
      console.error("Error starting scrape:", error)
      toast.error("Failed to start scraping")
      setViewState("search")
    }
  }

  const handleNewSearch = () => {
    setViewState("search")
    setJobId(null)
    setQuery("")
  }

  const handleExport = async (format: "csv" | "json") => {
    if (!jobId) return

    try {
      const res = await fetch(`/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, format }),
      })
      if (!res.ok) throw new Error("Export failed")

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `results.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export")
    }
  }

  const businesses = job?.results.map((r) => r.data) || []

  return (
    <section className="py-8 sm:py-20 md:py-32 min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="container max-w-3xl">
        {/* Search View */}
        {viewState === "search" && (
          <form onSubmit={handleSearch}>
            <div className="text-center space-y-6 sm:space-y-8">
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight px-2">
                  Find Local Businesses From Google Maps
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto px-4">
                  Scrape business data and export to CSV
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder='e.g. "restaurants paris"'
                      className="pl-9 h-12 sm:h-11 text-base touch-manipulation"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="h-12 sm:h-11 px-6 text-base touch-manipulation min-h-[48px] sm:min-h-[44px]">
                    Start Scraping
                  </Button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors touch-manipulation min-h-[44px]"
                  >
                    Advanced options
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    showAdvanced ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="border rounded-lg bg-white text-left divide-y divide-border">
                      <div className="p-4 sm:p-5">
                        <Label className="text-sm font-medium block mb-3">Search Depth</Label>
                        <Select value={String(depth)} onValueChange={(v) => setDepth(Number(v))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 (Fast, ~12 results)</SelectItem>
                            <SelectItem value="5">5 (Quick, ~60 results)</SelectItem>
                            <SelectItem value="10">10 (Balanced, ~120 results)</SelectItem>
                            <SelectItem value="20">20 (~240 results)</SelectItem>
                            <SelectItem value="50">50 (~600 results)</SelectItem>
                            <SelectItem value="100">100 (~1,200 results)</SelectItem>
                            <SelectItem value="200">200 (~2,400 results)</SelectItem>
                            <SelectItem value="500">500 (Max, ~6,000 results)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="no-website" className="text-sm font-medium block">
                            No Website Only
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Only businesses without websites
                          </p>
                        </div>
                        <Switch
                          id="no-website"
                          checked={noWebsite}
                          onCheckedChange={setNoWebsite}
                          className="flex-shrink-0"
                        />
                      </div>

                      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="extract-emails" className="text-sm font-medium block">
                            Extract Emails
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Slower, visits websites
                          </p>
                        </div>
                        <Switch
                          id="extract-emails"
                          checked={extractEmails}
                          onCheckedChange={setExtractEmails}
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Loading View */}
        {viewState === "loading" && (
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center px-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">{job?.query || query}</h2>
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
                <span>Scraping... Found {job?.resultsCount || 0} results</span>
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          </div>
        )}

        {/* Results View */}
        {viewState === "results" && job && (
          <div className="space-y-6">
            <div className="text-center px-4">
              <h2 className="text-xl sm:text-2xl font-bold mb-3">{job.query}</h2>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-sm">
                <span className="text-muted-foreground">{job.resultsCount} results</span>
                <button
                  onClick={handleNewSearch}
                  className="text-foreground hover:underline touch-manipulation min-h-[44px] inline-flex items-center"
                >
                  New search
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center gap-1.5 text-foreground hover:underline touch-manipulation min-h-[44px]">
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => handleExport("csv")} className="min-h-[44px] cursor-pointer">
                      CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("json")} className="min-h-[44px] cursor-pointer">
                      JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          </div>
        )}

        {/* Error View */}
        {viewState === "error" && (
          <div className="text-center space-y-4 px-4">
            <div className="border rounded-lg p-6 sm:p-8 bg-white">
              <p className="text-base font-medium mb-2">Scraping Failed</p>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to complete scraping. Please try again.
              </p>
              <Button onClick={handleNewSearch} variant="outline" className="min-h-[44px] touch-manipulation">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
