import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navbar Skeleton */}
      <div className="border-b border-border/80 h-20 px-6">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 w-full space-y-12">
        <div className="space-y-4 pb-8 border-b border-border/80">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border border-border p-6 space-y-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4 border-t border-border flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="border-t border-border/80 h-32" />
    </div>
  )
}

