import React, { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { SearchInterface } from '@/components/search/SearchInterface'
import { ArticleCardData } from '@/components/articles/ArticleCard'
import { Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Search Manuscripts',
  description: 'Search across peer-reviewed and educational research articles by keywords, abstract, and topics.',
  alternates: {
    canonical: '/search',
  },
}

export default async function SearchPage() {
  const supabase = await createClient()

  // 1. Check user authentication
  let isAuthor = false
  try {
    const { data: authData } = await supabase.auth.getUser()
    isAuthor = Boolean(authData?.user)
  } catch {
    isAuthor = false
  }

  // 2. Fetch all published articles
  let articles: ArticleCardData[] = []
  try {
    const { data } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        abstract,
        cover_image_url,
        reading_time_minutes,
        published_at,
        created_at,
        status,
        author:profiles(id, full_name, avatar_url, bio),
        article_categories(categories(id, name, slug)),
        article_tags(tags(id, name, slug))
      `)
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })

    if (data) {
      articles = data.map((item: any) => ({
        ...item,
        categories: item.article_categories
          ?.map((ac: any) => ac.categories)
          .filter(Boolean),
        tags: item.article_tags
          ?.map((at: any) => at.tags)
          .filter(Boolean),
      }))
    }
  } catch (err) {
    articles = []
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <PublicNavbar isAuthenticated={isAuthor} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 w-full space-y-12">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Search Repository</span>
        </nav>

        {/* Masthead Header */}
        <header className="space-y-3 pb-8 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Search className="size-3.5" />
            <span>Manuscript Index & Retrieval</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            Search Research Papers
          </h1>

          <p className="text-base sm:text-lg font-serif text-muted-foreground max-w-2xl leading-relaxed">
            Query empirical studies, theoretical proofs, system designs, and educational treatises across all published taxonomies.
          </p>
        </header>

        {/* Interactive Search Canvas */}
        <Suspense fallback={
          <div className="p-12 border border-border bg-card text-center text-xs font-mono text-muted-foreground">
            Initializing research search engine...
          </div>
        }>
          <SearchInterface initialArticles={articles} />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  )
}

