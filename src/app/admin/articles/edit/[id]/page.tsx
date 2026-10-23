import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/articles/ArticleForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Edit Manuscript | ScholarPress Admin',
  description: 'Revise scholarly manuscript, footnotes, and publication states.',
}

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch existing article with joined taxonomies
  const { data: article, error } = await supabase
    .from('articles')
    .select('*, article_categories(categories(*)), article_tags(tags(*))')
    .eq('id', id)
    .single()

  if (error || !article) {
    notFound()
  }

  // 2. Fetch all taxonomies
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  // 3. Format initialData
  const initialData = {
    ...article,
    categories: article.article_categories
      ?.map((ac: any) => ac.categories)
      .filter(Boolean),
    tags: article.article_tags
      ?.map((at: any) => at.tags)
      .filter(Boolean),
  }

  return (
    <div className="space-y-6">
      <ArticleForm
        articleId={id}
        categories={categories || []}
        tags={tags || []}
        initialData={initialData}
      />
    </div>
  )
}

