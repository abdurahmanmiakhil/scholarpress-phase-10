'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react'

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log unexpected runtime errors for diagnostic auditing
    console.error('ScholarPress Application Error Boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-6 selection:bg-neutral-900 selection:text-white">
      <div className="max-w-md w-full border border-border p-8 bg-card space-y-6 text-center shadow-none">
        <div className="size-12 rounded-none border border-border bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <AlertTriangle className="size-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
            Execution Exception
          </span>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
            System Error
          </h1>
          <p className="text-xs font-serif text-muted-foreground leading-relaxed">
            An unexpected error occurred while compiling or retrieving this manuscript. The fault has been logged.
          </p>
        </div>

        {error?.digest && (
          <div className="p-2.5 bg-muted font-mono text-[11px] text-muted-foreground border border-border/60 break-all select-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <RefreshCcw className="size-3.5" />
            <span>Try Again</span>
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

