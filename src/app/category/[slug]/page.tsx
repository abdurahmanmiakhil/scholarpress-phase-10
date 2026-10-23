import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { ArticleCard, ArticleCardData } from '@/components/articles/ArticleCard'
import { FolderTree, BookOpen, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!category) {
    return { title: 'Category Not Found' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const categoryUrl = `${siteUrl}/category/${slug}`
  const description = category.description || `Scholarly manuscripts and papers in ${category.name}.`

  return {
    title: `${category.name} Manuscripts`,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      title: `${category.name} Manuscripts | ScholarPress`,
      description,
      url: categoryUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} Manuscripts | ScholarPress`,
      description,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // 1. Fetch Category
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (catError || !category) {
    notFound()
  }

  // 2. Fetch authenticated user state
  let isAuthor = false
  try {
    const { data: authData } = await supabase.auth.getUser()
    isAuthor = Boolean(authData?.user)
  } catch {
    isAuthor = false
  }

  // 3. Fetch linked articles
  const { data: relations } = await supabase
    .from('article_categories')
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
    .eq('category_id', category.id)

  const articles: ArticleCardData[] = (relations || [])
    .map((r: any) => r.articles)
    .filter((a: any) => {
      if (!a) return false
      // Only show published articles where published_at has arrived
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
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Disciplines
          </Link>
          <span>/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Category Header */}
        <header className="space-y-4 pb-8 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <FolderTree className="size-3.5" />
            <span>Academic Discipline</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            {category.name}
          </h1>

          {category.description && (
            <p className="text-base sm:text-lg font-serif text-muted-foreground max-w-3xl leading-relaxed">
              {category.description}
            </p>
          )}

          <div className="text-xs font-mono text-muted-foreground pt-2">
            <span>{articles.length} published manuscript{articles.length === 1 ? '' : 's'}</span>
          </div>
        </header>

        {/* Articles List */}
        <section className="space-y-6">
          {articles.length === 0 ? (
            <div className="border border-dashed border-border p-16 text-center space-y-3 bg-muted/10">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <BookOpen className="size-6" />
              </div>
              <h3 className="font-serif text-xl font-medium">No published papers in this discipline</h3>
              <p className="text-xs text-muted-foreground font-mono max-w-md mx-auto">
                No articles have been assigned to {category.name} yet. Check back soon for forthcoming publications.
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

