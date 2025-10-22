"use client"

import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SearchFilters } from "@/lib/types"

interface FilterPanelProps {
  filters: SearchFilters
  setFilters: (filters: SearchFilters) => void
}

export function FilterPanel({ filters, setFilters }: FilterPanelProps) {
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-6">Filters</h2>

        <div className="space-y-6">
          {/* No Website Filter */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label htmlFor="no-website" className="text-sm font-medium">
                No Website Only
              </Label>
              <p className="text-sm text-muted-foreground">
                Only show businesses without websites
              </p>
            </div>
            <Switch
              id="no-website"
              checked={filters.noWebsite}
              onCheckedChange={(checked) => updateFilter("noWebsite", checked)}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Minimum Rating */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Minimum Rating</Label>
              <span className="text-sm text-muted-foreground">
                {filters.minRating ? `${filters.minRating}+ stars` : "Any"}
              </span>
            </div>
            <Slider
              min={0}
              max={5}
              step={0.5}
              value={[filters.minRating || 0]}
              onValueChange={(values) => updateFilter("minRating", values[0])}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Minimum Reviews */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Minimum Reviews</Label>
              <span className="text-sm text-muted-foreground">
                {filters.minReviews || "Any"}
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[filters.minReviews || 0]}
              onValueChange={(values) => updateFilter("minReviews", values[0])}
            />
          </div>

          <div className="h-px bg-border" />

          {/* Depth */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search Depth</Label>
            <Select
              value={String(filters.depth || 10)}
              onValueChange={(value) => updateFilter("depth", Number(value))}
            >
              <SelectTrigger>
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
            <p className="text-xs text-muted-foreground">
              Higher depth = more results but takes longer
            </p>
          </div>

          <div className="h-px bg-border" />

          {/* Extract Emails */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Label htmlFor="extract-emails" className="text-sm font-medium">
                Extract Emails
              </Label>
              <p className="text-sm text-muted-foreground">
                Visit websites to extract email addresses (slower)
              </p>
            </div>
            <Switch
              id="extract-emails"
              checked={filters.extractEmails}
              onCheckedChange={(checked) => updateFilter("extractEmails", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
