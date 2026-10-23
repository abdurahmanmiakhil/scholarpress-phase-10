import React from 'react'
import Link from 'next/link'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Button } from '@/components/ui/button'
import { FileQuestion, ArrowLeft, Search, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full flex flex-col items-center justify-center text-center space-y-8">
        <div className="size-16 rounded-none border border-border bg-muted/40 flex items-center justify-center text-muted-foreground">
          <FileQuestion className="size-8" />
        </div>

        <div className="space-y-3 max-w-lg">
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Error 404 • Missing Document
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            Manuscript Not Found
          </h1>
          <p className="text-sm font-serif text-muted-foreground leading-relaxed">
            The requested paper, research taxonomy, or URL slug does not exist in the ScholarPress repository or may have been retracted or archived.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/">
            <Button className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
              <ArrowLeft className="size-3.5" />
              <span>Return Home</span>
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
              <Search className="size-3.5" />
              <span>Search Repository</span>
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
              <BookOpen className="size-3.5" />
              <span>Browse Disciplines</span>
            </Button>
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

