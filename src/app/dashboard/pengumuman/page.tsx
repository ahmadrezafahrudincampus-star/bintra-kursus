import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Pengumuman' }

type AnnouncementRow = {
    id: string
    title: string
    content: string
    target_session_id: string | null
    created_at: string
}

export default async function DashboardPengumumanPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('session_id')
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{ session_id: string }[]>()
        .maybeSingle()

    let query = supabase
        .from('announcements')
        .select('id, title, content, target_session_id, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (enrollment?.session_id) {
        query = query.or(`target_session_id.is.null,target_session_id.eq.${enrollment.session_id}`)
    } else {
        query = query.is('target_session_id', null)
    }

    const { data: announcements } = await query.returns<AnnouncementRow[]>()
    const announcementList = announcements ?? []

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pengumuman</h1>
                <p className="mt-1 text-muted-foreground">
                    Informasi terbaru dari lembaga kursus dan sesi Anda akan tampil di sini.
                </p>
            </div>

            {announcementList.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Megaphone className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Belum ada pengumuman aktif.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {announcementList.map((announcement) => (
                        <Card key={announcement.id}>
                            <CardHeader className="border-b border-border/50 pb-4">
                                <CardTitle className="flex items-center justify-between gap-3 text-base">
                                    <span>{announcement.title}</span>
                                    <Badge variant={announcement.target_session_id ? 'secondary' : 'outline'}>
                                        {announcement.target_session_id ? 'Sesi Anda' : 'Umum'}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-5">
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{announcement.content}</p>
                                <p className="text-xs text-muted-foreground">
                                    Dipublikasikan {new Date(announcement.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
