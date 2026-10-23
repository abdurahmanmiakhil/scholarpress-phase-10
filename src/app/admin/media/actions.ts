'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteStorageFileAction(filePath: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized.' }
  }

  const { error } = await supabase.storage.from('article-covers').remove([filePath])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/media')
  return { success: true }
}

