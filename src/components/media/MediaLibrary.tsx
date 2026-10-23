'use client'

import React, { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { deleteStorageFileAction } from '@/app/admin/media/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import {
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react'

export interface StorageItem {
  name: string
  id?: string | null
  created_at?: string | null
  updated_at?: string | null
  last_accessed_at?: string | null
  metadata?: Record<string, any> | null
  folder: 'covers' | 'content'
  publicUrl: string
}

interface MediaLibraryProps {
  initialItems: StorageItem[]
}

export function MediaLibrary({ initialItems }: MediaLibraryProps) {
  const router = useRouter()
  const toast = useToast()
  const [filter, setFilter] = useState<'all' | 'covers' | 'content'>('all')
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredItems = initialItems.filter((item) => {
    if (filter === 'all') return true
    return item.folder === filter
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    setIsUploading(true)

    const folderTarget = filter === 'content' ? 'content' : 'covers'
    const res = await uploadImageToStorage(file, folderTarget)

    setIsUploading(false)
    if (res.error) {
      setErrorMsg(res.error)
      toast.error('Upload Failed', res.error)
      return
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    toast.success('Media Uploaded', `${file.name} saved to storage.`)
    router.refresh()
  }

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.info('URL Copied', 'Asset public address copied to clipboard.')
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  const handleDelete = (filePath: string) => {
    if (!window.confirm('Are you sure you wish to permanently delete this media file?')) {
      return
    }

    startTransition(async () => {
      const res = await deleteStorageFileAction(filePath)
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to delete file.')
        toast.error('Deletion Failed', res.error || 'Failed to delete file.')
      } else {
        toast.success('Asset Deleted', 'Media file permanently purged.')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Hidden upload input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading || isPending}
      />

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 text-xs border border-destructive/30 bg-destructive/10 text-destructive rounded-none">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Upload Zone & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border bg-card">
        {/* Filter buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="rounded-none font-mono text-xs"
          >
            All Files ({initialItems.length})
          </Button>
          <Button
            variant={filter === 'covers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('covers')}
            className="rounded-none font-mono text-xs"
          >
            Covers ({initialItems.filter((i) => i.folder === 'covers').length})
          </Button>
          <Button
            variant={filter === 'content' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('content')}
            className="rounded-none font-mono text-xs"
          >
            Manuscript Figures ({initialItems.filter((i) => i.folder === 'content').length})
          </Button>
        </div>

        {/* Upload Action */}
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isPending}
          className="rounded-none gap-2 font-mono text-xs uppercase tracking-wider"
        >
          {isUploading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud className="size-3.5" />
              <span>Upload New File</span>
            </>
          )}
        </Button>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center space-y-3 bg-muted/10">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium">No storage files found</h3>
            <p className="text-xs text-muted-foreground font-mono max-w-sm mx-auto">
              Upload article header banners or inline scientific figures to Supabase Storage.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-none gap-2 font-mono text-xs mt-2"
          >
            <UploadCloud className="size-3.5" />
            <span>Select File to Upload</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const itemId = item.id || item.name
            const isCopied = copiedId === itemId
            const fullPath = `${item.folder}/${item.name}`

            return (
              <Card key={itemId} className="rounded-none border-border overflow-hidden group shadow-none">
                <div className="aspect-[16/10] bg-muted relative overflow-hidden border-b border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.publicUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-2 left-2 text-[10px] font-mono bg-background/90 backdrop-blur px-1.5 py-0.5 border border-border uppercase">
                    {item.folder}
                  </span>
                </div>

                <CardContent className="p-3 space-y-2">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium truncate font-mono text-foreground" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground">
                      {item.metadata?.size
                        ? `${(item.metadata.size / 1024).toFixed(1)} KB`
                        : 'Image file'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-border">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleCopyUrl(item.publicUrl, itemId)}
                      className="rounded-none gap-1 font-mono text-[10px] flex-1"
                    >
                      {isCopied ? (
                        <>
                          <Check className="size-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </Button>

                    <a
                      href={item.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                      title="Open full size"
                    >
                      <ExternalLink className="size-3" />
                    </a>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDelete(fullPath)}
                      disabled={isPending}
                      className="rounded-none text-destructive hover:bg-destructive/10 size-7 p-0"
                      title="Delete file"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
