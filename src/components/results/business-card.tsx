"use client"

import { Phone, Globe, Star } from "lucide-react"
import type { Business } from "@/lib/types"

interface BusinessCardProps {
  business: Business
}

// Helper to parse and format address
function formatAddress(addressStr: string): string {
  if (!addressStr) return ""

  try {
    // Try to parse as JSON first
    const addr = JSON.parse(addressStr)
    const parts = []

    if (addr.street) parts.push(addr.street)
    if (addr.city) parts.push(addr.city)

    return parts.join(", ")
  } catch {
    // If not JSON, return as-is
    return addressStr
  }
}

export function BusinessCard({ business }: BusinessCardProps) {
  const hasWebsite = business.website && business.website.trim() !== ""

  const googleMapsUrl = business.latitude && business.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.title)}`

  const formattedAddress = formatAddress(business.complete_address)

  return (
    <div className="border rounded-lg p-4 sm:p-5 bg-white hover:shadow-sm transition-shadow">
      <div className="space-y-3">
        {/* Title with Rating */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium text-base flex-1 min-w-0">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline break-words"
            >
              {business.title}
            </a>
          </h3>
          {business.review_rating > 0 && (
            <div className="flex items-center gap-1 text-sm flex-shrink-0">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="font-medium">{business.review_rating}</span>
              <span className="text-muted-foreground text-xs">({business.review_count})</span>
            </div>
          )}
        </div>

        {/* Contact Info - Compact */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {business.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <a href={`tel:${business.phone}`} className="hover:text-foreground touch-manipulation">
                {business.phone}
              </a>
            </div>
          )}

          {formattedAddress && (
            <div className="text-xs break-words">
              {formattedAddress}
            </div>
          )}
        </div>

        {/* Website Button Only */}
        {hasWebsite && (
          <div className="pt-1">
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm border rounded hover:bg-accent transition-colors touch-manipulation min-h-[44px]"
            >
              <Globe className="h-4 w-4" />
              Website
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
