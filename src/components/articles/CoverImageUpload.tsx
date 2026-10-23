'use client'

import React, { useState, useRef } from 'react'
import { uploadImageToStorage } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react'

interface CoverImageUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function CoverImageUpload({ value, onChange, disabled }: CoverImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorMsg(null)
    setIsUploading(true)

    const res = await uploadImageToStorage(file, 'covers')

    setIsUploading(false)
    if (res.error) {
      setErrorMsg(res.error)
      return
    }

    if (res.url) {
      onChange(res.url)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = () => {
    onChange('')
    setErrorMsg(null)
  }

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 text-xs border border-destructive/30 bg-destructive/10 text-destructive rounded-none">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {value ? (
        // Preview State
        <div className="border border-border p-2 bg-muted/20 space-y-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[180px]">
              {value}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="rounded-none gap-1 font-mono text-[10px]"
              >
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <RefreshCw className="size-3" />
                )}
                <span>Replace</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={handleRemove}
                disabled={disabled || isUploading}
                className="rounded-none text-destructive hover:bg-destructive/10 size-6 p-0"
                title="Remove cover image"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Dropzone / Upload button state
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-border hover:border-foreground/60 p-6 text-center cursor-pointer transition-colors bg-muted/10 ${
            isUploading ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              {isUploading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-medium">
                {isUploading ? 'Uploading to Supabase Storage...' : 'Click to select article cover'}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                PNG, JPEG, WebP, GIF up to 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual URL fallback toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[10px] font-mono text-muted-foreground hover:text-foreground inline-flex items-center gap-1 underline underline-offset-2"
        >
          <LinkIcon className="size-3" />
          <span>{showUrlInput ? 'Hide manual URL' : 'Or paste external image URL'}</span>
        </button>

        {showUrlInput && (
          <div className="mt-2 space-y-1">
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="rounded-none text-xs font-mono h-8"
              disabled={disabled || isUploading}
            />
          </div>
        )}
      </div>
    </div>
  )
}
