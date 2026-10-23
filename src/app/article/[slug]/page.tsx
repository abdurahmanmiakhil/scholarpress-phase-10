import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { TiptapRenderer, extractHeadingsFromTiptap } from '@/components/articles/TiptapRenderer'
import { TableOfContents } from '@/components/articles/TableOfContents'
import { CitationBlock } from '@/components/articles/CitationBlock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldAlert,
  PenLine,
  ExternalLink,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select(`
      title,
      abstract,
      cover_image_url,
      published_at,
      updated_at,
      created_at,
      author:profiles(full_name, website),
      article_categories(categories(name)),
      article_tags(tags(name))
    `)
    .eq('slug', slug)
    .single()

  if (!article) {
    return {
      title: 'Manuscript Not Found',
      robots: { index: false, follow: false },
    }
  }

  const author = Array.isArray(article.author) ? article.author[0] : article.author
  const categories = (article.article_categories as any[])?.map((c) => c.categories?.name).filter(Boolean) || []
  const tags = (article.article_tags as any[])?.map((t) => t.tags?.name).filter(Boolean) || []
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const articleUrl = `${siteUrl}/article/${slug}`

  return {
    title: article.title,
    description: article.abstract || 'A scholarly research publication on ScholarPress.',
    authors: author?.full_name ? [{ name: author.full_name, url: author.website || undefined }] : [{ name: 'ScholarPress Author' }],
    keywords: [...categories, ...tags],
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: article.abstract || undefined,
      type: 'article',
      url: articleUrl,
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at || undefined,
      authors: author?.full_name ? [author.full_name] : ['ScholarPress Author'],
      tags: tags,
      section: categories[0] || 'Research',
      images: article.cover_image_url
        ? [
            {
              url: article.cover_image_url,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: article.cover_image_url ? 'summary_large_image' : 'summary',
      title: article.title,
      description: article.abstract || undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch user session to determine draft preview privileges
  let currentUser = null
  try {
    const { data: authData } = await supabase.auth.getUser()
    currentUser = authData?.user || null
  } catch {
    currentUser = null
  }

  // 2. Query manuscript
  const { data: article, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles(*),
      article_categories(categories(*)),
      article_tags(tags(*))
    `)
    .eq('slug', slug)
    .single()

  if (error || !article) {
    notFound()
  }

  // 3. Draft/Archive visibility check
  const isAuthor = Boolean(currentUser)
  const isPublished =
    article.status === 'published' &&
    article.published_at &&
    new Date(article.published_at) <= new Date()

  if (!isPublished && !isAuthor) {
    notFound()
  }

  // 4. Format data
  const categories = article.article_categories
    ?.map((ac: any) => ac.categories)
    .filter(Boolean) || []

  const tags = article.article_tags
    ?.map((at: any) => at.tags)
    .filter(Boolean) || []

  const primaryCategory = categories[0]
  const author = article.author
  const headings = extractHeadingsFromTiptap(article.content)

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

  // 5. Generate ScholarlyArticle Schema.org JSON-LD
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: article.title,
    description: article.abstract || undefined,
    image: article.cover_image_url ? [article.cover_image_url] : undefined,
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.created_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/article/${article.slug}`,
    },
    author: {
      '@type': 'Person',
      name: author?.full_name || 'ScholarPress Author',
      url: author?.website || undefined,
    },
    publisher: {
      '@type': 'Organization',
      name: 'ScholarPress',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
    keywords: tags.map((t: any) => t.name).join(', '),
    articleSection: primaryCategory?.name || 'Academic Research',
    inLanguage: 'en-US',
    license: 'https://creativecommons.org/licenses/by/4.0/',
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNavbar isAuthenticated={isAuthor} />

      {/* Author Preview Banner for Drafts / Archived manuscripts */}
      {!isPublished && isAuthor && (
        <aside aria-label="Author Preview Notice" className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-300 px-6 py-3">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 shrink-0" />
              <span>
                Author Preview Mode: This manuscript is currently in <strong>{article.status.toUpperCase()}</strong> status and is not visible to public readers.
              </span>
            </div>
            <Link href={`/admin/articles/edit/${article.id}`}>
              <Button size="xs" variant="outline" className="rounded-none gap-1.5 font-mono text-xs border-amber-500/40">
                <PenLine className="size-3" />
                <span>Edit in Admin</span>
              </Button>
            </Link>
          </div>
        </aside>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 w-full space-y-12">
        {/* Breadcrumb & Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/#articles" className="hover:text-foreground transition-colors">
            Manuscripts
          </Link>
          {primaryCategory && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={`/category/${primaryCategory.slug}`} className="hover:text-foreground transition-colors">
                {primaryCategory.name}
              </Link>
            </>
          )}
        </nav>

        {/* Article Masthead Header */}
        <header className="space-y-6 pb-8 border-b border-border/80">
          {/* Category & Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {primaryCategory && (
              <Badge variant="default" className="rounded-none font-mono text-xs uppercase px-2.5 py-0.5">
                {primaryCategory.name}
              </Badge>
            )}
            {tags.map((tag: any) => (
              <Link key={tag.id} href={`/tag/${tag.slug}`}>
                <span className="text-xs font-mono text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-0.5 transition-colors">
                  #{tag.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-foreground leading-[1.14] max-w-5xl">
            {article.title}
          </h1>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-mono text-muted-foreground pt-2">
            {/* Author */}
            <div className="flex items-center gap-2 text-foreground font-medium">
              <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{author?.full_name || 'Primary Author'}</span>
            </div>

            <span className="text-muted-foreground/40" aria-hidden="true">•</span>

            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5" aria-hidden="true" />
              <time dateTime={article.published_at || article.created_at}>
                {publishedDate}
              </time>
            </div>

            <span className="text-muted-foreground/40" aria-hidden="true">•</span>

            {/* Reading Time */}
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>{article.reading_time_minutes} min read</span>
            </div>

            {/* Jump to Citation link */}
            <span className="text-muted-foreground/40" aria-hidden="true">•</span>
            <a
              href="#citation"
              className="hover:text-foreground underline underline-offset-4 decoration-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
            >
              How to Cite
            </a>
          </div>
        </header>

        {/* Featured Cover Image Banner (if available) */}
        {article.cover_image_url && (
          <figure className="border border-border overflow-hidden bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full aspect-[21/9] object-cover"
            />
            <figcaption className="sr-only">{article.title}</figcaption>
          </figure>
        )}

        {/* Scholarly Abstract Synopsis Callout */}
        {article.abstract && (
          <section
            aria-label="Abstract"
            className="border-l-4 border-foreground bg-muted/20 p-6 sm:p-8 space-y-2"
          >
            <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-foreground">
              Abstract
            </h2>
            <p className="font-serif text-lg text-foreground/90 italic leading-relaxed">
              {article.abstract}
            </p>
          </section>
        )}

        {/* 2-Column Academic Reading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Main Manuscript Body (8 cols on lg) */}
          <article className="lg:col-span-8 space-y-16">
            {/* Tiptap JSON Document Renderer */}
            <TiptapRenderer content={article.content} />

            {/* Citation Box */}
            <section id="citation" aria-label="Academic Citation" className="pt-8 border-t border-border">
              <CitationBlock
                title={article.title}
                slug={article.slug}
                authorName={author?.full_name || undefined}
                publishedAt={article.published_at}
              />
            </section>

            {/* Author Biography Block */}
            <section aria-label="Author Information" className="border border-border p-8 bg-card space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <User className="size-3.5" aria-hidden="true" />
                <span>Author Biography</span>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold">
                  {author?.full_name || 'Primary Author'}
                </h3>
                <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                  {author?.bio ||
                    'Author and researcher publishing empirical studies and theoretical inquiries on ScholarPress.'}
                </p>
              </div>

              {author?.website && (
                <div className="pt-2">
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono underline inline-flex items-center gap-1 text-foreground"
                  >
                    <span>Author Website</span>
                    <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                </div>
              )}
            </section>
          </article>

          {/* Sticky Academic Aside (4 cols on lg) */}
          <aside aria-label="Manuscript Navigation and Meta" className="lg:col-span-4 sticky top-28 space-y-6 hidden lg:block">
            {/* Table of Contents */}
            <TableOfContents headings={headings} />

            {/* Metadata Card */}
            <div className="border border-border p-5 bg-card space-y-4 text-xs font-mono">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground block border-b border-border pb-1">
                Manuscript Information
              </span>

              <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Reading Estimate:</span>
                  <span className="text-foreground">{article.reading_time_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Publication State:</span>
                  <span className="text-foreground uppercase">{article.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Open Access:</span>
                  <span className="text-foreground">CC BY 4.0</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <Link
                  href="/#articles"
                  className="text-foreground hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" aria-hidden="true" />
                  <span>Return to all manuscripts</span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
