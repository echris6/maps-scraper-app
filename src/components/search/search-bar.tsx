"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { SearchFilters } from "@/lib/types"

interface SearchBarProps {
  query: string
  setQuery: (query: string) => void
  filters: SearchFilters
}

export function SearchBar({ query, setQuery, filters }: SearchBarProps) {
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query.trim()) {
      toast.error("Please enter a search query")
      return
    }

    // Create a scraping job
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), filters }),
      })

      if (!response.ok) {
        throw new Error("Failed to start scraping")
      }

      const { jobId } = await response.json()

      // Navigate to results page
      router.push(`/results/${jobId}`)
      toast.success("Scraping started! Redirecting...")
    } catch (error) {
      console.error("Error starting scrape:", error)
      toast.error("Failed to start scraping. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Search Query
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder='e.g., "pet grooming amsterdam"'
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        <Search className="mr-2 h-4 w-4" />
        Start Scraping
      </Button>
    </form>
  )
}
