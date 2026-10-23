import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ArticleLoading() {
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
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-12" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-3 w-20" />
          <span className="text-muted-foreground/30">/</span>
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Masthead Header Skeleton */}
        <header className="space-y-6 pb-8 border-b border-border/80">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full max-w-4xl" />
            <Skeleton className="h-12 w-2/3 max-w-2xl" />
          </div>

          <div className="flex gap-4 pt-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </header>

        {/* Abstract Box Skeleton */}
        <div className="border-l-4 border-muted p-6 sm:p-8 space-y-3 bg-muted/10">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-5/6" />
        </div>

        {/* 2-Column Body & Aside Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <Skeleton className="h-40 w-full" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-6 hidden lg:block">
            <div className="border border-border p-6 space-y-4">
              <Skeleton className="h-3 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="border-t border-border/80 h-32" />
    </div>
  )
}

