import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  try {
    const supabase = await createClient()

    // 1. Fetch published articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .lte('published_at', new Date().toISOString())

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: new Date(article.updated_at || article.published_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    // 2. Fetch categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, created_at')

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: new Date(cat.created_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    // 3. Fetch tags
    const { data: tags } = await supabase
      .from('tags')
      .select('slug, created_at')

    const tagRoutes: MetadataRoute.Sitemap = (tags || []).map((tag) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      lastModified: new Date(tag.created_at || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

    return [...staticRoutes, ...articleRoutes, ...categoryRoutes, ...tagRoutes]
  } catch (err) {
    console.error('Error generating dynamic sitemap:', err)
    return staticRoutes
  }
}

