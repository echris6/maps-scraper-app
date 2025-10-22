export function BusinessCardSkeleton() {
  return (
    <div className="border rounded-lg p-5 bg-white">
      <div className="space-y-3">
        {/* Title and category skeleton */}
        <div>
          <div className="h-5 bg-gray-100 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>

        {/* Rating skeleton */}
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-12" />
          <div className="h-4 bg-gray-100 rounded w-16" />
        </div>

        {/* Contact info skeleton */}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-4 w-4 bg-gray-100 rounded mt-0.5" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
          </div>
          <div className="flex items-start gap-2">
            <div className="h-4 w-4 bg-gray-100 rounded mt-0.5" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-100 rounded w-24" />
          <div className="h-8 bg-gray-100 rounded w-20" />
        </div>
      </div>
    </div>
  )
}
