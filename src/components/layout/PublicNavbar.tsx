'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { BookOpen, ShieldCheck, ArrowUpRight, Search, Menu, X } from 'lucide-react'

interface PublicNavbarProps {
  isAuthenticated?: boolean
}

export function PublicNavbar({ isAuthenticated = false }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/80">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Masthead Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="size-9 rounded-none bg-foreground text-background flex items-center justify-center font-serif font-bold text-lg">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight group-hover:underline decoration-1 underline-offset-4">
              ScholarPress
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Research & Scientific Inquiry
            </span>
          </div>
        </Link>

        {/* Desktop Navigation & Author Gateway */}
        <div className="hidden md:flex items-center space-x-6">
          <nav aria-label="Main Navigation" className="flex items-center space-x-6 text-xs font-mono tracking-wider uppercase text-muted-foreground">
            <Link href="/#articles" className="hover:text-foreground transition-colors">
              Manuscripts
            </Link>
            <Link href="/categories" className="hover:text-foreground transition-colors">
              Disciplines
            </Link>
            <Link href="/search" className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <Search className="size-3" aria-hidden="true" />
              <span>Search</span>
            </Link>
          </nav>

          <div className="flex items-center pl-2 border-l border-border/80">
            {isAuthenticated ? (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
                  <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
                  <span>Admin Console</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
                  <span>Author Portal</span>
                  <ArrowUpRight className="size-3 text-muted-foreground" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/search" aria-label="Search repository">
            <Button variant="ghost" size="icon-sm" className="rounded-none text-muted-foreground hover:text-foreground">
              <Search className="size-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="rounded-none text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden border-b border-border bg-background px-6 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex flex-col space-y-3 text-sm font-mono uppercase tracking-wider text-muted-foreground">
            <Link
              href="/#articles"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-foreground transition-colors flex items-center justify-between"
            >
              <span>Manuscripts</span>
              <span className="text-xs text-muted-foreground/50">Repository</span>
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-foreground transition-colors flex items-center justify-between"
            >
              <span>Disciplines</span>
              <span className="text-xs text-muted-foreground/50">Taxonomies</span>
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-foreground transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Search className="size-3.5" aria-hidden="true" />
                <span>Search</span>
              </div>
              <span className="text-xs text-muted-foreground/50">Query</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-border">
            {isAuthenticated ? (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-none gap-2 font-mono text-xs uppercase tracking-wider justify-center">
                  <ShieldCheck className="size-3.5 text-emerald-500" aria-hidden="true" />
                  <span>Admin Console</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-none gap-2 font-mono text-xs uppercase tracking-wider justify-center">
                  <span>Author Portal</span>
                  <ArrowUpRight className="size-3 text-muted-foreground" aria-hidden="true" />
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
