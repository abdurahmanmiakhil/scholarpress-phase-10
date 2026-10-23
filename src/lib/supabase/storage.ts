import { createClient } from '@/lib/supabase/client'

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Allowed formats: JPEG, PNG, WebP, GIF, AVIF.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1)
    return {
      valid: false,
      error: `File size exceeds 5MB limit (current: ${sizeInMb}MB). Please compress the image.`,
    }
  }

  return { valid: true }
}

/**
 * Uploads an image file to Supabase Storage bucket 'article-covers'
 * Supports two subdirectories: 'covers' (article headers) and 'content' (inline manuscript figures)
 */
export async function uploadImageToStorage(
  file: File,
  folder: 'covers' | 'content' = 'covers'
): Promise<{ url: string | null; error: string | null }> {
  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { url: null, error: validation.error || 'Validation failed' }
  }

  try {
    const supabase = createClient()

    // Generate unique, sanitized filename
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const cleanExtension = extension.replace(/[^a-z0-9]/g, '')
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 9)
    const filePath = `${folder}/${timestamp}-${randomSuffix}.${cleanExtension}`

    const { data, error } = await supabase.storage
      .from('article-covers')
      .upload(filePath, file, {
        cacheControl: '31536000',
        upsert: false,
      })

    if (error) {
      return { url: null, error: error.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from('article-covers')
      .getPublicUrl(data.path)

    return { url: publicUrlData.publicUrl, error: null }
  } catch (err: any) {
    return { url: null, error: err.message || 'An unexpected storage upload error occurred.' }
  }
}

