'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, LayoutDashboard } from 'lucide-react'

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('ScholarPress Admin Workspace Exception:', error)
  }, [error])

  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
      <div className="size-12 rounded-none border border-border bg-destructive/10 text-destructive flex items-center justify-center">
        <AlertCircle className="size-6" />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block">
          Admin Console Fault
        </span>
        <h2 className="text-2xl font-serif font-bold tracking-tight">
          Failed to Load Administrative Data
        </h2>
        <p className="text-xs font-serif text-muted-foreground leading-relaxed">
          The editorial database or storage transaction encountered an error. Please verify your Supabase connectivity.
        </p>
      </div>

      {error?.digest && (
        <div className="p-2 bg-muted font-mono text-[11px] text-muted-foreground border border-border/60">
          Digest: {error.digest}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => reset()}
          className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
        >
          <RefreshCcw className="size-3.5" />
          <span>Retry Operation</span>
        </Button>
        <Link href="/admin">
          <Button
            variant="outline"
            className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}

