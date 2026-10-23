import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { ArticleCard, ArticleCardData } from '@/components/articles/ArticleCard'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  FolderTree,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'ScholarPress | A Journal of Scientific Inquiry & Systems Research',
  description: 'An open-access publishing platform for empirical research, systems architecture, and computer science.',
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Check user authentication for navbar state
  let isAuthenticated = false
  try {
    const { data: authData } = await supabase.auth.getUser()
    isAuthenticated = Boolean(authData?.user)
  } catch (err) {
    isAuthenticated = false
  }

  // 2. Fetch published articles with author, categories, and tags
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

  // 3. Fetch categories
  let categories: any[] = []
  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    categories = catData || []
  } catch (err) {
    categories = []
  }

  // 4. Fetch author profile
  let authorProfile: any = null
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
      .single()
    authorProfile = profile
  } catch (err) {
    authorProfile = null
  }

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ScholarPress',
    url: siteUrl,
    description: 'An open-access academic and research publishing platform dedicated to empirical inquiry, systems architecture, and scientific discourse.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      {/* Masthead Navigation */}
      <PublicNavbar isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-20 w-full space-y-24">
        {/* Academic Manifesto Hero */}
        <section className="space-y-8 pb-12 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Open Access Scholarly Repository</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-foreground leading-[1.12] max-w-4xl">
            Empirical inquiry, distributed systems, & architectural theory.
          </h1>

          <p className="text-lg sm:text-xl font-serif text-muted-foreground max-w-2xl leading-relaxed">
            A single-author academic publication exploring computer science fundamentals, decentralized protocols, and formal methods. Free from commercial paywalls, proprietary trackers, or algorithmic feeds.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a href="#articles">
              <Button className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
                <span>Browse Manuscripts</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </a>
            <a href="#author">
              <Button variant="outline" className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
                <span>About Author</span>
              </Button>
            </a>
          </div>
        </section>

        {/* Featured Manuscript Section */}
        {featuredArticle && (
          <section id="featured" className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-foreground" />
                <h2 className="font-mono text-xs uppercase tracking-widest font-semibold text-foreground">
                  Featured Monograph
                </h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Latest Release</span>
            </div>

            <ArticleCard article={featuredArticle} variant="featured" />
          </section>
        )}

        {/* Recent Manuscripts Section */}
        <section id="articles" className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight">
                Published Manuscripts
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">
                Archived research papers and educational treatises ({articles.length} total)
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <span>Peer-reviewed & self-published</span>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center space-y-4 bg-muted/10">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="size-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-medium">No published manuscripts yet</h3>
                <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                  The author is currently preparing initial research papers for publication. Return shortly for forthcoming monographs.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="rounded-none font-mono text-xs">
                    Author Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherArticles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          )}
        </section>

        {/* Research Disciplines (Categories) */}
        <section id="disciplines" className="space-y-6 pt-8 border-t border-border">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold tracking-tight">
              Fields of Inquiry
            </h2>
            <p className="text-xs font-mono text-muted-foreground">
              Core academic disciplines curated in this journal
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="border border-border p-6 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Discipline
                  </span>
                  <FolderTree className="size-3.5 text-muted-foreground" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-xs text-muted-foreground font-serif leading-relaxed line-clamp-3">
                    {cat.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Author Bio Colophon */}
        <section id="author" className="border border-border bg-card p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <User className="size-3.5" />
            <span>Colophon & Author Statement</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-8 space-y-4">
              <h2 className="font-serif text-3xl font-bold tracking-tight">
                {authorProfile?.full_name || 'About the Author'}
              </h2>
              <p className="font-serif text-base text-muted-foreground leading-relaxed">
                {authorProfile?.bio ||
                  'Computer scientist, researcher, and systems architect. ScholarPress was created as an independent, single-author publishing venue dedicated to transparent research and open scientific distribution.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono text-muted-foreground">
                <span>Author Email: {authorProfile?.email || 'author@institution.edu'}</span>
                {authorProfile?.website && (
                  <a
                    href={authorProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-foreground inline-flex items-center gap-1"
                  >
                    <span>Personal Website</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="md:col-span-4 border border-border p-6 bg-muted/20 space-y-3 text-xs font-mono">
              <span className="text-muted-foreground uppercase text-[10px] tracking-wider block">
                Editorial Mandate
              </span>
              <p className="text-muted-foreground leading-relaxed">
                All articles are published under CC BY 4.0 licenses. Readers are permitted to share and adapt the material with appropriate attribution.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  )
}
