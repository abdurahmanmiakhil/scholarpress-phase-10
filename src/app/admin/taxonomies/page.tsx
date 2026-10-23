import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Tags, FolderTree } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TaxonomiesAdminPage() {
  let categories: any[] = []
  let tags: any[] = []

  try {
    const supabase = await createClient()
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    const { data: tagData } = await supabase.from('tags').select('*').order('name')
    categories = catData || []
    tags = tagData || []
  } catch (err) {
    categories = []
    tags = []
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
            <Tags className="size-3.5" />
            <span>Classification System</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Research Taxonomies</h1>
          <p className="text-sm text-muted-foreground">
            Academic categories and research tags for organizing manuscripts.
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm" className="rounded-none gap-2 font-mono text-xs">
            <ArrowLeft className="size-3.5" />
            <span>Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Categories */}
        <Card className="rounded-none border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FolderTree className="size-4 text-muted-foreground" />
              <CardTitle className="font-serif text-lg">Categories ({categories.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-xs font-mono text-muted-foreground">No categories registered.</p>
            ) : (
              <div className="divide-y divide-border">
                {categories.map((c) => (
                  <div key={c.id} className="py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.name}</span>
                      <code className="text-[11px] font-mono text-muted-foreground">/{c.slug}</code>
                    </div>
                    {c.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="rounded-none border-border shadow-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tags className="size-4 text-muted-foreground" />
              <CardTitle className="font-serif text-lg">Tags ({tags.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <p className="text-xs font-mono text-muted-foreground">No tags registered.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge
                    key={t.id}
                    variant="secondary"
                    className="rounded-none font-mono text-xs px-2.5 py-1"
                  >
                    #{t.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

