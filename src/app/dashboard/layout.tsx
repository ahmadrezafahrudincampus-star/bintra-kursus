import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import type { Metadata } from 'next'

import type { Profile } from '@/types/database'

export const metadata: Metadata = {
    title: { default: 'Dashboard', template: '%s | Dashboard' },
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role, avatar_url')
        .eq('id', user.id)
        .returns<Pick<Profile, 'id' | 'full_name' | 'role' | 'avatar_url'>[]>()
        .single()

    if (!profile) redirect('/login')

    // Admin should not be here
    if (profile.role === 'super_admin') redirect('/admin')

    return (
        <div className="min-h-screen flex bg-muted/30">
            <DashboardSidebar profile={profile} />
            <main className="flex-1 min-w-0 overflow-hidden">
                <div className="h-full p-4 md:p-8">{children}</div>
            </main>
        </div>
    )
}
