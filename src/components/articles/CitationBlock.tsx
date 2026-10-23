'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Quote, Copy, Check, Share2 } from 'lucide-react'

interface CitationBlockProps {
  title: string
  slug: string
  authorName?: string
  publishedAt?: string | null
}

export function CitationBlock({
  title,
  slug,
  authorName = 'Primary Author',
  publishedAt,
}: CitationBlockProps) {
  const [copiedType, setCopiedType] = useState<'apa' | 'bibtex' | 'link' | null>(null)

  const year = publishedAt ? new Date(publishedAt).getFullYear() : new Date().getFullYear()
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://scholarpress.pub'
  const articleUrl = `${siteUrl}/article/${slug}`

  // 1. APA Format
  const apaCitation = `${authorName} (${year}). ${title}. ScholarPress. ${articleUrl}`

  // 2. BibTeX Format
  const authorBibKey = authorName.replace(/\s+/g, '').toLowerCase() + year
  const bibtexCitation = `@article{${authorBibKey},
  title = {${title}},
  author = {${authorName}},
  journal = {ScholarPress},
  year = {${year}},
  url = {${articleUrl}}
}`

  const copyToClipboard = (text: string, type: 'apa' | 'bibtex' | 'link') => {
    navigator.clipboard.writeText(text)
    setCopiedType(type)
    setTimeout(() => {
      setCopiedType(null)
    }, 2000)
  }

  return (
    <Card className="rounded-none border-border bg-card shadow-none">
      <CardHeader className="pb-3 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="size-4 text-foreground" />
            <CardTitle className="font-serif text-base font-bold">
              Cite this Manuscript
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => copyToClipboard(articleUrl, 'link')}
            className="rounded-none gap-1 font-mono text-[11px]"
          >
            {copiedType === 'link' ? (
              <>
                <Check className="size-3 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="size-3" />
                <span>Share URL</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* APA Format */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>APA Format</span>
            <button
              type="button"
              onClick={() => copyToClipboard(apaCitation, 'apa')}
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              {copiedType === 'apa' ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copiedType === 'apa' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="p-3 bg-muted/30 border border-border text-xs font-serif leading-relaxed text-foreground select-all">
            {apaCitation}
          </div>
        </div>

        {/* BibTeX Format */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>BibTeX Entry</span>
            <button
              type="button"
              onClick={() => copyToClipboard(bibtexCitation, 'bibtex')}
              className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              {copiedType === 'bibtex' ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              <span>{copiedType === 'bibtex' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/30 border border-border text-[11px] font-mono text-foreground leading-relaxed overflow-x-auto select-all">
            <code>{bibtexCitation}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

