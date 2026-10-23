'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutAction } from '@/app/admin/actions'
import { Button } from '@/components/ui/button'
import {
  FileText,
  PenLine,
  Tags,
  ExternalLink,
  LogOut,
  Shield,
  Loader2,
  BookOpen,
  UserCheck,
  Image as ImageIcon,
  Menu,
  X
} from 'lucide-react'

interface AdminSidebarProps {
  userEmail?: string
  authorName?: string
}

export function AdminSidebar({ userEmail, authorName }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    {
      title: 'Articles Overview',
      href: '/admin',
      icon: FileText,
      exact: true,
    },
    {
      title: 'Write Article',
      href: '/admin/articles/new',
      icon: PenLine,
      exact: false,
    },
    {
      title: 'Taxonomies',
      href: '/admin/taxonomies',
      icon: Tags,
      exact: false,
    },
    {
      title: 'Media & Storage',
      href: '/admin/media',
      icon: ImageIcon,
      exact: false,
    },
  ]

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction()
    })
  }

  return (
    <>
      {/* Mobile Sticky Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="size-4 text-foreground" />
          <span className="font-serif text-base font-bold tracking-tight">ScholarPress</span>
          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 text-muted-foreground uppercase">
            Admin
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close admin menu' : 'Open admin menu'}
          className="rounded-none text-muted-foreground hover:text-foreground"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {/* Mobile Drawer Panel */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-card px-6 py-6 space-y-6 animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Editorial Navigation
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-none transition-colors ${
                    isActive
                      ? 'bg-foreground text-background font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              )
            })}

            <div className="pt-3 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Public View
            </div>
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="size-4 shrink-0" />
                <span>Live Publication</span>
              </div>
              <span className="text-[10px] font-mono bg-muted-foreground/10 px-1.5 py-0.5">Visit</span>
            </Link>
          </nav>

          <div className="pt-4 border-t border-border space-y-3">
            <div className="text-xs text-muted-foreground font-mono">
              Signed in as: <span className="text-foreground">{authorName || userEmail}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={isPending}
              className="w-full rounded-none justify-center gap-2 text-xs font-mono"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex w-64 min-h-screen bg-card text-card-foreground border-r border-border/80 flex-col justify-between shrink-0">
        {/* Top Branding & Navigation */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/80 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-foreground" />
              <span className="font-serif text-lg font-bold tracking-tight">ScholarPress</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              <Shield className="size-3 text-emerald-600 dark:text-emerald-400" />
              <span>Admin Workspace</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Editorial Management
            </div>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-none transition-colors ${
                    isActive
                      ? 'bg-foreground text-background font-semibold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.title}</span>
                </Link>
              )
            })}

            <div className="pt-4 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Public Gateway
            </div>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="size-4 shrink-0" />
                <span>Live Publication</span>
              </div>
              <span className="text-[10px] font-mono bg-muted-foreground/10 px-1.5 py-0.5">Visit</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Author Profile & Sign Out */}
        <div className="p-4 border-t border-border/80 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
              <UserCheck className="size-4 text-foreground" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium truncate font-sans text-foreground">
                {authorName || userEmail?.split('@')[0] || 'Primary Author'}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground truncate">
                {userEmail || 'author@institution.edu'}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={isPending}
            className="w-full rounded-none justify-start gap-2.5 text-xs font-mono text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Terminating session...</span>
              </>
            ) : (
              <>
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  )
}
