import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllAnnouncements } from '@/lib/actions/announcement'
import { AnnouncementAdminClient } from '@/components/admin/AnnouncementAdminClient'
import { Megaphone } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pengumuman | Admin' }

export default async function AdminPengumumanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [announcements, sessionsResult] = await Promise.all([
        getAllAnnouncements(),
        supabase.from('sessions').select('id, name').eq('is_active', true).order('name').returns<{ id: string; name: string }[]>(),
    ])

    const sessions = sessionsResult.data ?? []

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Pengumuman</h1>
                <p className="text-muted-foreground mt-1">Buat dan kelola pengumuman untuk siswa</p>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        Daftar Pengumuman
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <AnnouncementAdminClient initialAnnouncements={announcements} sessions={sessions} />
                </CardContent>
            </Card>
        </div>
    )
}
