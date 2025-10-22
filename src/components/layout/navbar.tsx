"use client"

import Link from "next/link"
import { Map } from "lucide-react"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    router.push("/")
    // Force a hard refresh to reset all state
    window.location.href = "/"
  }

  return (
    <nav className="w-full border-b bg-white">
      <div className="container flex h-14 items-center px-4 sm:px-6">
        <Link
          href="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2 hover:opacity-60 transition-opacity touch-manipulation min-h-[44px]"
        >
          <Map className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-semibold text-base">Maps Scraper</span>
        </Link>
      </div>
    </nav>
  )
}
