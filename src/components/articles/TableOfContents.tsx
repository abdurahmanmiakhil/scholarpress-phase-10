'use client'

import React, { useEffect, useState } from 'react'
import type { TocHeading } from '@/components/articles/TiptapRenderer'
import { ListOrdered, ArrowUp } from 'lucide-react'

interface TableOfContentsProps {
  headings: TocHeading[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0% -60% 0%',
        threshold: 0.1,
      }
    )

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  const scrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveId(id)
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <nav className="border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border text-xs font-mono uppercase tracking-widest text-muted-foreground">
        <ListOrdered className="size-3.5" />
        <span>Outline of Contents</span>
      </div>

      <ul className="space-y-2 text-xs font-serif leading-snug">
        {headings.map((heading) => {
          const isActive = activeId === heading.id

          return (
            <li
              key={heading.id}
              className={`${heading.level === 3 ? 'pl-3.5 border-l border-border/80 ml-1' : ''}`}
            >
              <a
                href={`#${heading.id}`}
                onClick={(e) => scrollToHeading(e, heading.id)}
                className={`block transition-colors py-0.5 ${
                  isActive
                    ? 'font-bold text-foreground underline underline-offset-4 decoration-1'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {heading.text}
              </a>
            </li>
          )
        })}
      </ul>

      <div className="pt-2 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-[11px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <ArrowUp className="size-3" />
          <span>Top of paper</span>
        </button>
      </div>
    </nav>
  )
}

