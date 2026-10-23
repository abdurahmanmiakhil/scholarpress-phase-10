import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navbar Skeleton */}
      <div className="border-b border-border/80 h-20 px-6">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 w-full space-y-10">
        <div className="space-y-4 pb-6 border-b border-border/80">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Search bar input skeleton */}
        <Skeleton className="h-14 w-full" />

        {/* Filter tags skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-28" />
          <Skeleton className="h-7 w-24" />
        </div>

        {/* Results grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-border p-6 space-y-4 h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </main>

      <div className="border-t border-border/80 h-32" />
    </div>
  )
}

