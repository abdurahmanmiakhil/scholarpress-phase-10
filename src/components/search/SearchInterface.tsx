'use client'

import React, { useState, useTransition, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArticleCard, ArticleCardData } from '@/components/articles/ArticleCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, BookOpen, Filter } from 'lucide-react'

interface SearchInterfaceProps {
  initialArticles: ArticleCardData[]
  initialQuery?: string
}

export function SearchInterface({ initialArticles, initialQuery = '' }: SearchInterfaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Extract all unique categories present in the articles
  const availableCategories = useMemo(() => {
    const map = new Map<string, string>()
    initialArticles.forEach((article) => {
      article.categories?.forEach((cat) => {
        map.set(cat.slug, cat.name)
      })
    })
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))
  }, [initialArticles])

  // Filter articles based on query and selected category
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    return initialArticles.filter((article) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const hasCategory = article.categories?.some((c) => c.slug === selectedCategory)
        if (!hasCategory) return false
      }

      // Query filter
      if (!q) return true

      const inTitle = article.title.toLowerCase().includes(q)
      const inSlug = article.slug.toLowerCase().includes(q)
      const inAbstract = article.abstract?.toLowerCase().includes(q) || false
      const inCategories = article.categories?.some((c) => c.name.toLowerCase().includes(q)) || false
      const inTags = article.tags?.some((t) => t.name.toLowerCase().includes(q)) || false

      return inTitle || inSlug || inAbstract || inCategories || inTags
    })
  }, [initialArticles, query, selectedCategory])

  const handleQueryChange = (val: string) => {
    setQuery(val)
    const params = new URLSearchParams(window.location.search)
    if (val.trim()) {
      params.set('q', val.trim())
    } else {
      params.delete('q')
    }
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search'
    window.history.replaceState(null, '', newUrl)
  }

  const handleClear = () => {
    setQuery('')
    router.replace('/search')
  }

  return (
    <div className="space-y-8">
      {/* Search Bar Input */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search manuscripts by title, abstract keywords, discipline, or methodology..."
            aria-label="Search manuscripts"
            className="rounded-none pl-12 pr-12 h-14 font-serif text-lg bg-card border-border shadow-none focus-visible:ring-1 focus-visible:ring-foreground"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Category Filters Bar */}
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono">
            <span className="text-muted-foreground mr-1 flex items-center gap-1">
              <Filter className="size-3" />
              <span>Filter:</span>
            </span>
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="xs"
              onClick={() => setSelectedCategory('all')}
              className="rounded-none font-mono text-[11px]"
            >
              All Fields
            </Button>
            {availableCategories.map((cat) => (
              <Button
                key={cat.slug}
                variant={selectedCategory === cat.slug ? 'default' : 'outline'}
                size="xs"
                onClick={() => setSelectedCategory(cat.slug)}
                className="rounded-none font-mono text-[11px]"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-mono text-muted-foreground">
        <span>
          {query
            ? `Found ${results.length} manuscript${results.length === 1 ? '' : 's'} matching "${query}"`
            : `Showing all ${results.length} published manuscripts`}
        </span>
        {selectedCategory !== 'all' && (
          <span className="text-foreground font-semibold">
            Filtered by: {availableCategories.find((c) => c.slug === selectedCategory)?.name}
          </span>
        )}
      </div>

      {/* Results Grid */}
      {results.length === 0 ? (
        <div className="border border-dashed border-border p-16 text-center space-y-3 bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <BookOpen className="size-6" />
          </div>
          <h3 className="font-serif text-xl font-medium">No matching research manuscripts found</h3>
          <p className="text-xs text-muted-foreground font-mono max-w-sm mx-auto">
            Try adjusting your search terms, searching for broader technical keywords, or clearing active filters.
          </p>
          {(query || selectedCategory !== 'all') && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('')
                  setSelectedCategory('all')
                  router.replace('/search')
                }}
                className="rounded-none font-mono text-xs"
              >
                Reset Search Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      )}
    </div>
  )
}

