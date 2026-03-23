import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'
import type { Profile } from '@/types/database'

export const metadata: Metadata = {
    title: { default: 'Admin', template: '%s | Admin Panel' },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user!.id)
        .returns<Pick<Profile, 'id' | 'full_name' | 'role'>[]>()
        .single()

    if (!profile || profile.role !== 'super_admin') redirect('/dashboard')

    return (
        <div className="min-h-screen flex bg-muted/20">
            <AdminSidebar profile={profile} />
            <main className="flex-1 min-w-0 overflow-hidden">
                <div className="h-full p-4 md:p-8">{children}</div>
            </main>
        </div>
    )
}
