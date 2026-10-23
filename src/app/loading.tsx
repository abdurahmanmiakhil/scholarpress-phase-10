import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Navbar Skeleton */}
      <div className="border-b border-border/80 h-20 px-6">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="size-9" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-24" />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Skeleton className="hidden md:block h-3 w-20" />
            <Skeleton className="hidden md:block h-3 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 w-full space-y-24">
        {/* Academic Manifesto Hero Skeleton */}
        <section className="space-y-8 pb-12 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full max-w-4xl" />
            <Skeleton className="h-12 w-3/4 max-w-3xl" />
          </div>
          <Skeleton className="h-6 w-full max-w-2xl" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
          </div>
        </section>

        {/* Featured Manuscript Skeleton */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="border border-border p-8 sm:p-12 space-y-6">
            <div className="flex gap-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-10 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="pt-4 border-t border-border flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </section>

        {/* Standard Grid Skeletons */}
        <section className="space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border p-6 space-y-4 h-64 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="pt-4 border-t border-border flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer Skeleton */}
      <div className="border-t border-border/80 h-32" />
    </div>
  )
}

