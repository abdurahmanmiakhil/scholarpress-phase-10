'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ArticleStatus } from '@/types/database.types'

export interface ArticleFormPayload {
  title: string
  slug: string
  abstract: string
  content: any
  cover_image_url?: string | null
  status: ArticleStatus
  category_ids?: string[]
  tag_ids?: string[]
}

function calculateReadingTime(abstract: string, content: any): number {
  let wordCount = abstract ? abstract.split(/\s+/).length : 0

  const extractTextFromTiptap = (node: any): string => {
    if (!node) return ''
    if (typeof node.text === 'string') return node.text
    if (Array.isArray(node.content)) {
      return node.content.map(extractTextFromTiptap).join(' ')
    }
    return ''
  }

  const contentText = extractTextFromTiptap(content)
  wordCount += contentText.trim() ? contentText.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(wordCount / 200))
}

function sanitizeSlug(slug: string, title: string): string {
  return (slug || title)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * 1. Create Article
 */
export async function createArticleAction(payload: ArticleFormPayload) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized: You must be logged in as an author.' }
  }

  const {
    title,
    slug,
    abstract,
    content,
    cover_image_url,
    status,
    category_ids = [],
    tag_ids = [],
  } = payload

  if (!title || !title.trim()) {
    return { success: false, error: 'Article title is required.' }
  }

  const cleanSlug = sanitizeSlug(slug, title)
  if (!cleanSlug) {
    return { success: false, error: 'Valid URL slug is required.' }
  }

  const readingTimeMinutes = calculateReadingTime(abstract, content)
  const publishedAt = status === 'published' ? new Date().toISOString() : null

  // Insert Article
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .insert({
      author_id: user.id,
      title: title.trim(),
      slug: cleanSlug,
      abstract: abstract?.trim() || null,
      content: content || {},
      cover_image_url: cover_image_url?.trim() || null,
      status,
      reading_time_minutes: readingTimeMinutes,
      published_at: publishedAt,
    })
    .select('id, slug')
    .single()

  if (articleError) {
    if (articleError.code === '23505') {
      return { success: false, error: 'An article with this URL slug already exists. Please customize the slug.' }
    }
    return { success: false, error: articleError.message }
  }

  // Associate Categories
  if (category_ids.length > 0) {
    const categoryRows = category_ids.map((catId) => ({
      article_id: article.id,
      category_id: catId,
    }))
    await supabase.from('article_categories').insert(categoryRows)
  }

  // Associate Tags
  if (tag_ids.length > 0) {
    const tagRows = tag_ids.map((tagId) => ({
      article_id: article.id,
      tag_id: tagId,
    }))
    await supabase.from('article_tags').insert(tagRows)
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath(`/article/${article.slug}`)

  return { success: true, articleId: article.id, slug: article.slug }
}

/**
 * 2. Update Article
 */
export async function updateArticleAction(articleId: string, payload: ArticleFormPayload) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized.' }
  }

  const {
    title,
    slug,
    abstract,
    content,
    cover_image_url,
    status,
    category_ids = [],
    tag_ids = [],
  } = payload

  if (!title || !title.trim()) {
    return { success: false, error: 'Article title is required.' }
  }

  const cleanSlug = sanitizeSlug(slug, title)
  if (!cleanSlug) {
    return { success: false, error: 'Valid URL slug is required.' }
  }

  // Fetch current article state
  const { data: existing, error: fetchError } = await supabase
    .from('articles')
    .select('id, status, published_at')
    .eq('id', articleId)
    .single()

  if (fetchError || !existing) {
    return { success: false, error: 'Manuscript not found.' }
  }

  const readingTimeMinutes = calculateReadingTime(abstract, content)

  let publishedAt = existing.published_at
  if (status === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString()
  }

  // Update Article Row
  const { error: updateError } = await supabase
    .from('articles')
    .update({
      title: title.trim(),
      slug: cleanSlug,
      abstract: abstract?.trim() || null,
      content: content || {},
      cover_image_url: cover_image_url?.trim() || null,
      status,
      reading_time_minutes: readingTimeMinutes,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)

  if (updateError) {
    if (updateError.code === '23505') {
      return { success: false, error: 'An article with this URL slug already exists.' }
    }
    return { success: false, error: updateError.message }
  }

  // Sync Categories
  await supabase.from('article_categories').delete().eq('article_id', articleId)
  if (category_ids.length > 0) {
    const categoryRows = category_ids.map((catId) => ({
      article_id: articleId,
      category_id: catId,
    }))
    await supabase.from('article_categories').insert(categoryRows)
  }

  // Sync Tags
  await supabase.from('article_tags').delete().eq('article_id', articleId)
  if (tag_ids.length > 0) {
    const tagRows = tag_ids.map((tagId) => ({
      article_id: articleId,
      tag_id: tagId,
    }))
    await supabase.from('article_tags').insert(tagRows)
  }

  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath(`/article/${cleanSlug}`)

  return { success: true, articleId, slug: cleanSlug }
}

/**
 * 3. Toggle Status (Draft <-> Published <-> Archived)
 */
export async function toggleArticleStatusAction(articleId: string, newStatus: ArticleStatus) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { data: existing } = await supabase
    .from('articles')
    .select('published_at, slug')
    .eq('id', articleId)
    .single()

  let publishedAt = existing?.published_at
  if (newStatus === 'published' && !publishedAt) {
    publishedAt = new Date().toISOString()
  }

  const { error } = await supabase
    .from('articles')
    .update({
      status: newStatus,
      published_at: publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', articleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  if (existing?.slug) {
    revalidatePath(`/article/${existing.slug}`)
  }

  return { success: true }
}

/**
 * 4. Permanently Delete Article
 */
export async function deleteArticleAction(articleId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { data: article } = await supabase
    .from('articles')
    .select('slug')
    .eq('id', articleId)
    .single()

  const { error } = await supabase.from('articles').delete().eq('id', articleId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  if (article?.slug) {
    revalidatePath(`/article/${article.slug}`)
  }

  return { success: true }
}
