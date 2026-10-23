import React from 'react'
import Link from 'next/link'
import { BookOpen, ShieldCheck, ArrowUpRight } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="border-t border-border/80 bg-muted/20 text-muted-foreground font-sans">
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <nav aria-label="Footer Navigation" className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Colophon */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-foreground">
              <span className="font-serif text-lg font-bold tracking-tight">ScholarPress</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm font-serif">
              An open-access academic publishing platform dedicated to computer science, distributed architectures, computational philosophy, and empirical systems research.
            </p>
            <div className="pt-2 text-[11px] font-mono text-muted-foreground/80 space-y-1">
              <p>Published under Creative Commons Attribution 4.0 (CC BY 4.0).</p>
              <p>No paywalls • No proprietary tracking • Permanent DOI-ready slugs.</p>
            </div>
          </div>

          {/* Research Areas */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
              Disciplines
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/categories" className="hover:text-foreground transition-colors">
                  All Disciplines
                </Link>
              </li>
              <li>
                <Link href="/category/computer-science" className="hover:text-foreground transition-colors">
                  Computer Science
                </Link>
              </li>
              <li>
                <Link href="/category/artificial-intelligence" className="hover:text-foreground transition-colors">
                  Artificial Intelligence
                </Link>
              </li>
              <li>
                <Link href="/category/distributed-systems" className="hover:text-foreground transition-colors">
                  Distributed Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Governance & Access */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-foreground font-semibold">
              Editorial
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  <span>Author Console</span>
                  <ArrowUpRight className="size-2.5" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link href="/#author" className="hover:text-foreground transition-colors">
                  Author Biography
                </Link>
              </li>
              <li>
                <Link href="/#articles" className="hover:text-foreground transition-colors">
                  All Manuscripts
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-foreground transition-colors">
                  Search Repository
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom Bar */}
        <div className="border-t border-border/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono">
          <p>© {new Date().getFullYear()} ScholarPress. Single-Author Publishing Architecture.</p>
          <div className="flex items-center space-x-4">
            <span>Next.js 16</span>
            <span>•</span>
            <span>Supabase RLS</span>
            <span>•</span>
            <span>Tiptap JSON</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

