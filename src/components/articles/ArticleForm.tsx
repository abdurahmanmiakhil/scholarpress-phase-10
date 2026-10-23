'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { createArticleAction, updateArticleAction } from '@/app/admin/articles/actions'
import { CoverImageUpload } from '@/components/articles/CoverImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import type { Database, ArticleStatus } from '@/types/database.types'
import {
  ArrowLeft,
  Loader2,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Tag as TagIcon,
  FolderTree,
  FileText,
  Archive,
  ArrowUpRight
} from 'lucide-react'

type Category = Database['public']['Tables']['categories']['Row']
type Tag = Database['public']['Tables']['tags']['Row']

interface ArticleFormProps {
  articleId?: string
  categories: Category[]
  tags: Tag[]
  initialData?: any
}

export function ArticleForm({ articleId, categories, tags, initialData }: ArticleFormProps) {
  const router = useRouter()
  const toast = useToast()
  const isEditMode = Boolean(articleId)
  const [isPending, startTransition] = useTransition()

  // Form states
  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug))
  const [abstract, setAbstract] = useState(initialData?.abstract || '')
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.cover_image_url || '')
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c: any) => c.id) || []
  )
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((t: any) => t.id) || []
  )
  const [contentJson, setContentJson] = useState<any>(initialData?.content || null)
  const [currentStatus, setCurrentStatus] = useState<ArticleStatus>(initialData?.status || 'draft')

  // Status & error tracking
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Auto-generate slug from title (only in create mode by default)
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!isCustomSlug && !isEditMode) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generated)
    }
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    )
  }

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = (targetStatus: ArticleStatus) => {
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!title.trim()) {
      setErrorMsg('Please specify an article title.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    if (!slug.trim()) {
      setErrorMsg('A unique URL slug is required.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    startTransition(async () => {
      try {
        const payload = {
          title,
          slug,
          abstract,
          content: contentJson,
          cover_image_url: coverImageUrl,
          status: targetStatus,
          category_ids: selectedCategoryIds,
          tag_ids: selectedTagIds,
        }

        const res = isEditMode && articleId
          ? await updateArticleAction(articleId, payload)
          : await createArticleAction(payload)

        if (!res.success) {
          setErrorMsg(res.error || 'Failed to save manuscript.')
          toast.error('Save Failure', res.error || 'Failed to save manuscript.')
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        setCurrentStatus(targetStatus)
        const toastMsg =
          targetStatus === 'published'
            ? 'Article successfully published!'
            : targetStatus === 'archived'
            ? 'Article moved to archive.'
            : 'Manuscript draft saved!'

        setSuccessMsg(toastMsg)
        toast.success(
          targetStatus === 'published'
            ? 'Article Published'
            : targetStatus === 'archived'
            ? 'Article Archived'
            : 'Draft Saved',
          toastMsg
        )

        setTimeout(() => {
          router.push('/admin')
          router.refresh()
        }, 800)
      } catch (err: any) {
        const errorText = err.message || 'An unexpected error occurred while saving.'
        setErrorMsg(errorText)
        toast.error('Unexpected Exception', errorText)
      }
    })
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="rounded-none gap-2 font-mono text-xs">
              <ArrowLeft className="size-3.5" />
              <span>Overview</span>
            </Button>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            {isEditMode ? 'Edit Manuscript' : 'New Manuscript'}
          </span>
          {isEditMode && (
            <Badge
              variant={
                currentStatus === 'published'
                  ? 'default'
                  : currentStatus === 'draft'
                  ? 'secondary'
                  : 'outline'
              }
              className="rounded-none font-mono text-[10px] uppercase ml-2"
            >
              {currentStatus}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Live Article Link if already published */}
          {isEditMode && currentStatus === 'published' && slug && (
            <Link href={`/article/${slug}`} target="_blank">
              <Button variant="ghost" size="sm" className="rounded-none gap-1 font-mono text-xs text-muted-foreground hover:text-foreground">
                <span>View Live</span>
                <ArrowUpRight className="size-3" />
              </Button>
            </Link>
          )}

          {/* Save as Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleSubmit('draft')}
            disabled={isPending}
            className="rounded-none gap-2 font-mono text-xs"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isEditMode ? 'Save Draft' : 'Save Draft'}</span>
          </Button>

          {/* Archive button if editing an existing article */}
          {isEditMode && currentStatus !== 'archived' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit('archived')}
              disabled={isPending}
              className="rounded-none gap-1.5 font-mono text-xs text-muted-foreground hover:text-destructive"
            >
              <Archive className="size-3.5" />
              <span>Archive</span>
            </Button>
          )}

          {/* Publish Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => handleSubmit('published')}
            disabled={isPending}
            className="rounded-none gap-2 font-mono text-xs"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            <span>{isEditMode ? 'Publish Changes' : 'Publish Article'}</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 border border-destructive/30 bg-destructive/10 text-destructive text-sm font-sans rounded-none">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 p-4 border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-sm font-sans rounded-none">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Writing Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card className="rounded-none border-border shadow-none">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-mono text-xs uppercase tracking-wider">
                  Manuscript Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Distributed Consensus in Asynchronous Byzantine Networks"
                  className="rounded-none font-serif text-xl h-12"
                  disabled={isPending}
                  required
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label htmlFor="slug" className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    URL Slug
                  </Label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSlug(!isCustomSlug)}
                    className="text-[11px] font-mono text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    {isCustomSlug ? 'Auto-generate from title' : 'Customize URL slug'}
                  </button>
                </div>
                <div className="flex items-center border border-input bg-muted/20 px-3">
                  <span className="text-xs font-mono text-muted-foreground select-none">
                    /article/
                  </span>
                  <input
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true)
                      setSlug(e.target.value)
                    }}
                    placeholder="article-slug"
                    className="w-full bg-transparent px-1 py-2 text-xs font-mono outline-none"
                    disabled={isPending || (!isCustomSlug && !isEditMode)}
                  />
                </div>
              </div>

              {/* Abstract */}
              <div className="space-y-1.5">
                <Label htmlFor="abstract" className="font-mono text-xs uppercase tracking-wider">
                  Scholarly Abstract / Summary
                </Label>
                <Textarea
                  id="abstract"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide an academic synopsis summarizing theoretical premises, experimental methodology, and key contributions..."
                  rows={4}
                  className="rounded-none font-serif text-sm leading-relaxed"
                  disabled={isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tiptap Rich Text Content Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>Manuscript Body (Tiptap JSON)</span>
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                Footnotes: use <code className="bg-muted px-1">[#]</code> toolbar action
              </span>
            </div>

            <TiptapEditor
              content={contentJson}
              onChange={(json) => {
                setContentJson(json)
              }}
              placeholder="Begin drafting section introductions, theorem proofs, literature citations, or data analyses..."
              editable={!isPending}
            />
          </div>
        </div>

        {/* Sidebar Metadata Column (1 Col) */}
        <div className="space-y-6">
          {/* Cover Image */}
          <Card className="rounded-none border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-muted-foreground" />
                <CardTitle className="font-serif text-base">Cover Image</CardTitle>
              </div>
              <CardDescription className="text-xs font-sans">
                Featured manuscript header image saved to Supabase Storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CoverImageUpload
                value={coverImageUrl}
                onChange={setCoverImageUrl}
                disabled={isPending}
              />
            </CardContent>
          </Card>

          {/* Academic Categories */}
          <Card className="rounded-none border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="size-4 text-muted-foreground" />
                <CardTitle className="font-serif text-base">Categories</CardTitle>
              </div>
              <CardDescription className="text-xs font-sans">
                Primary disciplinary field.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground">No categories available.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id)
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`w-full flex items-center justify-between p-2 text-left text-xs transition-colors border ${
                          isSelected
                            ? 'border-foreground bg-foreground text-background font-medium'
                            : 'border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <code className={`text-[10px] font-mono ${isSelected ? 'text-background/80' : 'text-muted-foreground'}`}>
                          /{cat.slug}
                        </code>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Research Tags */}
          <Card className="rounded-none border-border shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TagIcon className="size-4 text-muted-foreground" />
                <CardTitle className="font-serif text-base">Research Tags</CardTitle>
              </div>
              <CardDescription className="text-xs font-sans">
                Specific methodologies, topics, or technologies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tags.length === 0 ? (
                <p className="text-xs font-mono text-muted-foreground">No tags available.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id)
                    return (
                      <Badge
                        key={tag.id}
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => toggleTag(tag.id)}
                        className="cursor-pointer rounded-none font-mono text-xs px-2 py-0.5 select-none"
                      >
                        #{tag.name}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
