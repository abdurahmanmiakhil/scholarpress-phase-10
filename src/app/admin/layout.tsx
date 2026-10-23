import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

export const metadata = {
  title: 'Admin Dashboard | ScholarPress',
  description: 'Editorial workspace for research article management.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let profile: Profile | null = null

  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    user = authData?.user

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = profileData as Profile | null
    }
  } catch (err) {
    user = null
  }

  // Double-check protection inside the Server Component layout
  if (!user) {
    redirect('/login?redirectTo=/admin')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row selection:bg-neutral-900 selection:text-white">
      <AdminSidebar
        userEmail={user.email}
        authorName={profile?.full_name || undefined}
      />
      <main className="flex-1 overflow-y-auto min-h-screen p-6 md:p-10">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

