export * from './database.types'

export interface ArticleWithTaxonomies {
  id: string
  title: string
  slug: string
  abstract: string | null
  content: any
  cover_image_url: string | null
  status: 'draft' | 'published' | 'archived'
  reading_time_minutes: number
  published_at: string | null
  created_at: string
  updated_at: string
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    bio: string | null
  }
  categories?: {
    id: string
    name: string
    slug: string
  }[]
  tags?: {
    id: string
    name: string
    slug: string
  }[]
}

