import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PublicNavbar } from '@/components/layout/PublicNavbar'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FolderTree, Tag as TagIcon, ArrowRight, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Academic Disciplines & Taxonomies',
  description: 'Explore research papers by academic category, disciplinary field, and research tag.',
  alternates: {
    canonical: '/categories',
  },
}

export default async function CategoriesIndexPage() {
  const supabase = await createClient()

  // 1. Fetch authenticated state
  let isAuthor = false
  try {
    const { data: authData } = await supabase.auth.getUser()
    isAuthor = Boolean(authData?.user)
  } catch {
    isAuthor = false
  }

  // 2. Fetch categories with article counts
  const [{ data: categories }, { data: tags }, { data: relations }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
    supabase.from('article_categories').select('category_id, articles!inner(status, published_at)'),
  ])

  // Count published articles per category
  const publishedCounts: Record<string, number> = {}
  if (relations) {
    relations.forEach((r: any) => {
      const art = r.articles
      if (
        art?.status === 'published' &&
        art?.published_at &&
        new Date(art.published_at) <= new Date()
      ) {
        publishedCounts[r.category_id] = (publishedCounts[r.category_id] || 0) + 1
      }
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-neutral-900 selection:text-white">
      <PublicNavbar isAuthenticated={isAuthor} />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 md:py-16 w-full space-y-16">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Disciplines</span>
        </nav>

        {/* Masthead Header */}
        <header className="space-y-4 pb-8 border-b border-border/80">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <FolderTree className="size-3.5" />
            <span>Academic Classification</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-foreground">
            Fields of Inquiry
          </h1>

          <p className="text-base sm:text-lg font-serif text-muted-foreground max-w-2xl leading-relaxed">
            Scholarly manuscripts indexed across primary computational disciplines, theoretical frameworks, and research methodologies.
          </p>
        </header>

        {/* Categories Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="text-xl font-serif font-bold tracking-tight">Primary Disciplines</h2>
            <span className="text-xs font-mono text-muted-foreground">{categories?.length || 0} fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories?.map((cat) => {
              const count = publishedCounts[cat.id] || 0

              return (
                <Link key={cat.id} href={`/category/${cat.slug}`} className="group block">
                  <Card className="rounded-none border-border bg-card h-full transition-all group-hover:border-foreground/50 shadow-none">
                    <CardHeader className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          /{cat.slug}
                        </span>
                        <span className="text-xs font-mono bg-muted px-2 py-0.5 text-foreground">
                          {count} paper{count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <CardTitle className="font-serif text-2xl font-bold group-hover:underline decoration-1 underline-offset-4">
                        {cat.name}
                      </CardTitle>
                      {cat.description && (
                        <CardDescription className="font-serif text-sm text-muted-foreground leading-relaxed pt-1">
                          {cat.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-2 flex justify-end">
                      <span className="text-xs font-mono font-medium inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Explore field</span>
                        <ArrowRight className="size-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Research Tags Cloud */}
        {tags && tags.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <TagIcon className="size-3.5" />
                <span>Research Topics & Keywords</span>
              </div>
              <h2 className="text-xl font-serif font-bold tracking-tight">Index of Tags</h2>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/tag/${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className="rounded-none font-mono text-xs px-3 py-1 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  )
}

