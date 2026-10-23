import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { MediaLibrary, StorageItem } from '@/components/media/MediaLibrary'
import { Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Media & Storage | ScholarPress Admin',
  description: 'Manage article cover banners and inline research diagrams.',
}

export default async function AdminMediaPage() {
  const supabase = await createClient()

  let items: StorageItem[] = []

  try {
    // 1. Fetch covers
    const { data: coverFiles } = await supabase.storage
      .from('article-covers')
      .list('covers', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (coverFiles) {
      const coverItems: StorageItem[] = coverFiles
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => {
          const { data } = supabase.storage
            .from('article-covers')
            .getPublicUrl(`covers/${f.name}`)

          return {
            ...f,
            folder: 'covers',
            publicUrl: data.publicUrl,
          }
        })
      items.push(...coverItems)
    }

    // 2. Fetch inline content figures
    const { data: contentFiles } = await supabase.storage
      .from('article-covers')
      .list('content', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (contentFiles) {
      const contentItems: StorageItem[] = contentFiles
        .filter((f) => f.name !== '.emptyFolderPlaceholder')
        .map((f) => {
          const { data } = supabase.storage
            .from('article-covers')
            .getPublicUrl(`content/${f.name}`)

          return {
            ...f,
            folder: 'content',
            publicUrl: data.publicUrl,
          }
        })
      items.push(...contentItems)
    }
  } catch (error) {
    items = []
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest mb-1">
            <ImageIcon className="size-3.5" />
            <span>Supabase Cloud Storage</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            Media & Scientific Assets
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Article cover headers, inline research figures, and diagrams hosted on Supabase Storage.
          </p>
        </div>
      </div>

      {/* Interactive Library */}
      <MediaLibrary initialItems={items} />
    </div>
  )
}

