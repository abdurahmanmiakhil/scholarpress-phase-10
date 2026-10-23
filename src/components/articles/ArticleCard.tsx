import React from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, Clock, Calendar, User } from 'lucide-react'

export interface ArticleCardData {
  id: string
  title: string
  slug: string
  abstract: string | null
  cover_image_url: string | null
  reading_time_minutes: number
  published_at: string | null
  created_at: string
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    bio?: string | null
  } | null
  categories?: {
    id: string
    name: string
    slug: string
  }[]
  tags?: {
    id: string
    name: string
    slug: string
  }[]
}

interface ArticleCardProps {
  article: ArticleCardData
  variant?: 'featured' | 'standard'
}

export function ArticleCard({ article, variant = 'standard' }: ArticleCardProps) {
  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(article.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })

  const primaryCategory = article.categories?.[0]

  if (variant === 'featured') {
    return (
      <article className="border border-border bg-card group transition-all hover:border-foreground/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Optional Cover Image Banner */}
          {article.cover_image_url && (
            <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-muted border-b lg:border-b-0 lg:border-r border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
            </div>
          )}

          {/* Featured Content Column */}
          <div className={`${article.cover_image_url ? 'lg:col-span-7' : 'lg:col-span-12'} p-8 sm:p-12 flex flex-col justify-between space-y-6`}>
            <div className="space-y-4">
              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {primaryCategory && (
                  <span className="bg-foreground text-background font-semibold px-2.5 py-0.5 uppercase tracking-wider text-[11px]">
                    {primaryCategory.name}
                  </span>
                )}
                <time dateTime={article.published_at || article.created_at} className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" aria-hidden="true" />
                  <span>{publishedDate}</span>
                </time>
                <span className="text-muted-foreground/50" aria-hidden="true">•</span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" aria-hidden="true" />
                  <span>{article.reading_time_minutes} min read</span>
                </span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-foreground leading-[1.2] group-hover:underline decoration-1 underline-offset-4">
                <Link href={`/article/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>

              {/* Abstract */}
              {article.abstract && (
                <p className="text-base sm:text-lg text-muted-foreground font-serif leading-relaxed line-clamp-4">
                  {article.abstract}
                </p>
              )}

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Read Link */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <User className="size-3.5" />
                <span>{article.author?.full_name || 'Primary Author'}</span>
              </div>

              <Link
                href={`/article/${article.slug}`}
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-semibold text-foreground hover:translate-x-1 transition-transform"
              >
                <span>Read Full Manuscript</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Standard Card
  return (
    <article className="border border-border bg-card p-6 flex flex-col justify-between group hover:border-foreground/50 transition-colors h-full space-y-4">
      <div className="space-y-3">
        {/* Category & Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
          {primaryCategory ? (
            <span className="bg-muted text-foreground px-2 py-0.5 text-[10px] uppercase font-semibold">
              {primaryCategory.name}
            </span>
          ) : (
            <span className="text-[10px] uppercase">Research Paper</span>
          )}
          <span>{article.reading_time_minutes} min read</span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-xl tracking-tight text-foreground leading-snug group-hover:underline decoration-1 underline-offset-4">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h3>

        {/* Abstract */}
        {article.abstract && (
          <p className="text-xs text-muted-foreground font-serif leading-relaxed line-clamp-3">
            {article.abstract}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-border/80 flex items-center justify-between text-xs font-mono text-muted-foreground">
        <time dateTime={article.published_at || article.created_at}>{publishedDate}</time>
        <Link
          href={`/article/${article.slug}`}
          aria-label={`Read ${article.title}`}
          className="inline-flex items-center gap-1 text-foreground font-semibold group-hover:translate-x-1 transition-transform"
        >
          <span>Read</span>
          <ArrowRight className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

