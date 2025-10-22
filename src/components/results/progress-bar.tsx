"use client"

import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  progress: number
  resultsCount: number
}

export function ProgressBar({ progress, resultsCount }: ProgressBarProps) {
  return (
    <div className="border rounded-lg p-8 bg-white text-center">
      <p className="text-sm font-medium mb-4">
        {progress < 100 ? "Scraping in progress" : "Scraping complete"}
      </p>

      <Progress value={progress} className="mb-4" />

      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
        <span>{progress}%</span>
        <span>•</span>
        <span>{resultsCount} result{resultsCount !== 1 ? "s" : ""} found</span>
      </div>
    </div>
  )
}
