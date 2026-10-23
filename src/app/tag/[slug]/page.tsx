import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { ArticleCard, ArticleCardData } from '@/components/articles/ArticleCard'
import { Tag as TagIcon, BookOpen, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface TagPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: TagPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single()

  if (!tag) {
    return { title: 'Tag Not Found' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const tagUrl = `${siteUrl}/tag/${slug}`
  const description = `Scholarly manuscripts and research papers tagged with #${tag.name} on ScholarPress.`

  return {
    title: `#${tag.name} Research Papers`,
    description,
    alternates: {
      canonical: tagUrl,
    },
    openGraph: {
      title: `#${tag.name} Research Papers | ScholarPress`,
      description,
      url: tagUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `#${tag.name} Research Papers | ScholarPress`,
      description,
    },
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Tag
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single()

  if (tagError || !tag) {
    notFound()
  }

  // 2. Fetch authenticated state
  let isAuthor = false
  try {
    const { data: authData } = await supabase.auth.getUser()
    isAuthor = Boolean(authData?.user)
  } catch {
    isAuthor = false
  }

  // 3. Fetch linked articles
  const { data: relations } = await supabase
    .from('article_tags')
    .select(`
      articles (
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
      )
    `)
    .eq('tag_id', tag.id)

  const articles: ArticleCardData[] = (relations || [])
    .map((r: any) => r.articles)
    .filter((a: any) => {
      if (!a) return false
      return (
        a.status === 'published' &&
        a.published_at &&
        new Date(a.published_at) <= new Date()
      )
    })
    .map((a: any) => ({
      ...a,
      categories: a.article_categories?.map((ac: any) => ac.categories).filter(Boolean),
      tags: a.article_tags?.map((at: any) => at.tags).filter(Boolean),
    }))
    .sort((a, b) => {
      const dateA = new Date(a.published_at || a.created_at).getTime()
      const dateB = new Date(b.published_at || b.created_at).getTime()
      return dateB - dateA
    })

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
          <span className="text-muted-foreground">Tags</span>
          <span>/</span>
          <span className="text-foreground">#{tag.name}</span>
        </nav>

        {/* Tag Header */}
        <header className="space-y-4 pb-8 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <TagIcon className="size-3.5" />
            <span>Research Topic & Methodology</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            #{tag.name}
          </h1>

          <p className="text-sm font-mono text-muted-foreground">
            {articles.length} published manuscript{articles.length === 1 ? '' : 's'} linked to this tag
          </p>
        </header>

        {/* Articles List */}
        <section className="space-y-6">
          {articles.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center space-y-3 bg-muted/10">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="size-6" />
              </div>
              <h3 className="font-serif text-xl font-medium">No published papers for this tag</h3>
              <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                No manuscripts with tag #{tag.name} have been published yet.
              </p>
              <div className="pt-2">
                <Link
                  href="/#articles"
                  className="text-xs font-mono underline inline-flex items-center gap-1.5 text-foreground"
                >
                  <ArrowLeft className="size-3" />
                  <span>Browse all manuscripts</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="standard" />
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

