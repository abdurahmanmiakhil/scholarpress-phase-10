'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toggleArticleStatusAction, deleteArticleAction } from '@/app/admin/articles/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import type { Database, ArticleStatus } from '@/types/database.types'
import {
  FileText,
  Search,
  PenLine,
  Eye,
  Trash2,
  Archive,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react'

type ArticleRow = Database['public']['Tables']['articles']['Row'] & {
  article_categories?: {
    categories: Database['public']['Tables']['categories']['Row'] | null
  }[]
  article_tags?: {
    tags: Database['public']['Tables']['tags']['Row'] | null
  }[]
}

interface ArticlesTableProps {
  articles: ArticleRow[]
}

export function ArticlesTable({ articles }: ArticlesTableProps) {
  const router = useRouter()
  const toast = useToast()
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter & Search Logic
  const filteredArticles = articles.filter((article) => {
    // Tab filter
    if (filter !== 'all' && article.status !== filter) {
      return false
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const titleMatch = article.title.toLowerCase().includes(q)
      const slugMatch = article.slug.toLowerCase().includes(q)
      const abstractMatch = article.abstract?.toLowerCase().includes(q)
      return titleMatch || slugMatch || abstractMatch
    }

    return true
  })

  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    draft: articles.filter((a) => a.status === 'draft').length,
    archived: articles.filter((a) => a.status === 'archived').length,
  }

  const handleToggleStatus = (articleId: string, targetStatus: ArticleStatus) => {
    setLoadingActionId(articleId)
    startTransition(async () => {
      const res = await toggleArticleStatusAction(articleId, targetStatus)
      setLoadingActionId(null)
      if (res.success) {
        toast.success(
          'Status Updated',
          `Manuscript is now ${targetStatus.toUpperCase()}.`
        )
        router.refresh()
      } else {
        toast.error('Action Failed', res.error || 'Failed to update article status.')
      }
    })
  }

  const handleDelete = (articleId: string, title: string) => {
    if (!window.confirm(`Permanently delete manuscript: "${title}"?\nThis action cannot be undone.`)) {
      return
    }

    setLoadingActionId(articleId)
    startTransition(async () => {
      const res = await deleteArticleAction(articleId)
      setLoadingActionId(null)
      if (res.success) {
        toast.success('Manuscript Deleted', `"${title}" has been removed from the repository.`)
        router.refresh()
      } else {
        toast.error('Deletion Failed', res.error || 'Failed to delete article.')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and Tabs Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 border border-border bg-card">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-none font-mono text-xs"
          >
            All ({counts.all})
          </Button>
          <Button
            variant={filter === 'published' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('published')}
            className="rounded-none font-mono text-xs"
          >
            Published ({counts.published})
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('draft')}
            className="rounded-none font-mono text-xs"
          >
            Drafts ({counts.draft})
          </Button>
          <Button
            variant={filter === 'archived' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('archived')}
            className="rounded-none font-mono text-xs"
          >
            Archived ({counts.archived})
          </Button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, slug, abstract..."
            className="rounded-none pl-9 text-xs font-mono h-8"
          />
        </div>
      </div>

      {/* Manuscripts Table */}
      {filteredArticles.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <FileText className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium">No matching manuscripts</h3>
            <p className="text-xs text-muted-foreground font-mono max-w-sm mx-auto">
              {searchQuery
                ? `No articles found matching "${searchQuery}".`
                : 'No articles in this lifecycle category.'}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="rounded-none font-mono text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="border border-border divide-y divide-border bg-card">
          {filteredArticles.map((article) => {
            const isLoadingThis = loadingActionId === article.id && isPending
            const categories = article.article_categories
              ?.map((ac) => ac.categories?.name)
              .filter(Boolean)
            const tags = article.article_tags
              ?.map((at) => at.tags?.name)
              .filter(Boolean)

            return (
              <div
                key={article.id}
                className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isLoadingThis ? 'opacity-50 pointer-events-none' : 'hover:bg-muted/20'
                }`}
              >
                {/* Article Info */}
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Badge */}
                    <Badge
                      variant={
                        article.status === 'published'
                          ? 'default'
                          : article.status === 'draft'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="rounded-none font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
                    >
                      {article.status === 'published' && <CheckCircle2 className="size-3 mr-1 inline text-emerald-400" />}
                      {article.status === 'draft' && <Clock className="size-3 mr-1 inline text-amber-500" />}
                      {article.status === 'archived' && <Archive className="size-3 mr-1 inline text-muted-foreground" />}
                      {article.status}
                    </Badge>

                    {/* Published / Created Date */}
                    <span className="text-xs font-mono text-muted-foreground">
                      {article.status === 'published' && article.published_at ? (
                        <>Published {new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      ) : (
                        <>Created {new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>
                      )}
                    </span>

                    <span className="text-muted-foreground/40">•</span>

                    <span className="text-xs font-mono text-muted-foreground">
                      {article.reading_time_minutes} min read
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <div>
                    <Link
                      href={`/admin/articles/edit/${article.id}`}
                      className="font-serif font-bold text-lg text-foreground hover:underline decoration-1 underline-offset-4 block truncate"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mt-0.5">
                      <span>/article/{article.slug}</span>
                    </div>
                  </div>

                  {/* Abstract snippet */}
                  {article.abstract && (
                    <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed max-w-3xl">
                      {article.abstract}
                    </p>
                  )}

                  {/* Taxonomies */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {categories?.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-mono text-foreground bg-muted px-2 py-0.5 border border-border"
                      >
                        {cat}
                      </span>
                    ))}
                    {tags?.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-muted-foreground px-1 py-0.5"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
                  {/* Status Toggler */}
                  {article.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(article.id, 'published')}
                      disabled={isLoadingThis}
                      className="rounded-none text-xs font-mono hover:bg-foreground hover:text-background"
                      title="Promote directly to published"
                    >
                      {isLoadingThis ? <Loader2 className="size-3 animate-spin" /> : 'Publish'}
                    </Button>
                  )}

                  {article.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(article.id, 'draft')}
                      disabled={isLoadingThis}
                      className="rounded-none text-xs font-mono text-muted-foreground hover:text-foreground"
                      title="Revert back to draft"
                    >
                      {isLoadingThis ? <Loader2 className="size-3 animate-spin" /> : 'Unpublish'}
                    </Button>
                  )}

                  {article.status === 'archived' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(article.id, 'draft')}
                      disabled={isLoadingThis}
                      className="rounded-none text-xs font-mono"
                      title="Restore to drafts"
                    >
                      {isLoadingThis ? <Loader2 className="size-3 animate-spin" /> : 'Restore'}
                    </Button>
                  )}

                  {/* Edit */}
                  <Link href={`/admin/articles/edit/${article.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none text-xs font-mono gap-1"
                    >
                      <PenLine className="size-3" />
                      <span>Edit</span>
                    </Button>
                  </Link>

                  {/* View Live */}
                  {article.status === 'published' && (
                    <Link href={`/article/${article.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none text-xs font-mono gap-1 text-muted-foreground hover:text-foreground"
                        title="View live publication"
                      >
                        <Eye className="size-3" />
                        <ArrowUpRight className="size-2.5" />
                      </Button>
                    </Link>
                  )}

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(article.id, article.title)}
                    disabled={isLoadingThis}
                    className="rounded-none text-destructive hover:bg-destructive/10 size-8 p-0"
                    title="Permanently delete article"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

