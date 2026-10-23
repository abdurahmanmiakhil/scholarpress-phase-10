import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArticlesTable } from '@/components/articles/ArticlesTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/database.types'
import {
  PenLine,
  FileText,
  CheckCircle2,
  Clock,
  Tags,
  Archive,
  BookOpen
} from 'lucide-react'

export const dynamic = 'force-dynamic'

type ArticleRow = Database['public']['Tables']['articles']['Row'] & {
  article_categories?: {
    categories: Database['public']['Tables']['categories']['Row'] | null
  }[]
  article_tags?: {
    tags: Database['public']['Tables']['tags']['Row'] | null
  }[]
}

export default async function AdminDashboardPage() {
  let articles: ArticleRow[] = []
  let totalCount = 0
  let publishedCount = 0
  let draftCount = 0
  let archivedCount = 0
  let categoriesCount = 0

  try {
    const supabase = await createClient()

    // 1. Fetch articles with categories and tags
    const { data: articlesData, count } = await supabase
      .from('articles')
      .select('*, article_categories(categories(*)), article_tags(tags(*))', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(100)

    if (articlesData) {
      articles = articlesData as unknown as ArticleRow[]
      totalCount = count || articles.length
      publishedCount = articles.filter((a) => a.status === 'published').length
      draftCount = articles.filter((a) => a.status === 'draft').length
      archivedCount = articles.filter((a) => a.status === 'archived').length
    }

    // 2. Fetch categories count
    const { count: catCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    categoriesCount = catCount || 0
  } catch (error) {
    articles = []
  }

  return (
    <div className="space-y-10">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
            <BookOpen className="size-3.5" />
            <span>Editorial Workspace</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Articles Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Monitor research publications, manage draft revisions, and review taxonomy assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/articles/new">
            <Button className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider">
              <PenLine className="size-4" />
              <span>New Article</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-none border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Total Manuscripts
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold">{totalCount}</div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Across all lifecycle states</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Published
            </CardTitle>
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-emerald-700 dark:text-emerald-400">
              {publishedCount}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Publicly accessible</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Active Drafts
            </CardTitle>
            <Clock className="size-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold text-amber-700 dark:text-amber-400">
              {draftCount}
            </div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Unreleased revisions</p>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border/80 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Archived
            </CardTitle>
            <Archive className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif font-bold">{archivedCount}</div>
            <p className="text-[11px] font-mono text-muted-foreground mt-1">Hidden from public view</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Manuscripts Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-semibold tracking-tight">Manuscripts Directory</h2>
          <span className="text-xs font-mono text-muted-foreground">Single Author Administration</span>
        </div>

        <ArticlesTable articles={articles} />
      </div>
    </div>
  )
}
