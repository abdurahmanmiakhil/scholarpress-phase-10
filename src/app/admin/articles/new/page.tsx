import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/articles/ArticleForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Compose Article | ScholarPress Admin',
  description: 'Authoring interface for research manuscripts and educational articles.',
}

export default async function NewArticlePage() {
  const supabase = await createClient()

  // Fetch registered categories and tags from Supabase
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('tags').select('*').order('name'),
  ])

  return (
    <div className="space-y-6">
      <ArticleForm
        categories={categories || []}
        tags={tags || []}
      />
    </div>
  )
}
