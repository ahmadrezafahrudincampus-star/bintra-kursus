import { createClient } from '@/lib/supabase/server'
import { ApproveRejectClient } from '@/components/admin/ApproveRejectClient'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Pendaftar' }

export default async function AdminPendaftarPage() {
    const supabase = await createClient()

    const { data: registrations } = await supabase
        .from('registrations')
        .select(`
      id, full_name, reg_number, gender, phone, email, address,
      school_name, participant_category, class_name,
      parent_name, parent_phone, experience, goals,
      preferred_session_id, status, rejection_reason,
      created_at, updated_at,
      course_master(id, name),
      sessions(id, name, day_of_week, start_time, end_time, current_count, max_capacity)
    `)
        .order('created_at', { ascending: false })

    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, name, day_of_week, start_time, end_time, current_count, max_capacity, course_id')
        .eq('is_active', true)

    interface SessionList {
        id: string
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        current_count: number
        max_capacity: number
        course_id: string
    }
    const sessionsData = (sessions ?? []) as SessionList[]

    interface RegistrationList {
        id: string
        full_name: string
        reg_number: string | null
        gender: "L" | "P"
        phone: string
        email: string | null
        address: string
        school_name: string
        participant_category: "SMP" | "SMA" | "Umum"
        class_name: string | null
        parent_name: string | null
        parent_phone: string | null
        experience: string | null
        goals: string | null
        preferred_session_id: string | null
        status: string
        rejection_reason: string | null
        created_at: string
        updated_at: string
        course_master: { id: string; name: string } | null
        sessions: { id: string; name: string; day_of_week: string; start_time: string; end_time: string; current_count: number; max_capacity: number } | null
    }

    const regData = (registrations ?? []) as RegistrationList[]
    const pending = regData.filter((r) => r.status === 'PENDING')
    const others = regData.filter((r) => r.status !== 'PENDING')

    const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        PENDING: { label: 'Menunggu', variant: 'outline' },
        APPROVED: { label: 'Disetujui', variant: 'default' },
        REJECTED: { label: 'Ditolak', variant: 'destructive' },
        DRAFT: { label: 'Draft', variant: 'secondary' },
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold">Kelola Pendaftar</h1>
                <p className="text-muted-foreground mt-1">
                    {pending.length} pendaftar menunggu review · {regData.length} total
                </p>
            </div>

            {/* Pending Section */}
            {pending.length > 0 && (
                <Card className="border-yellow-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-yellow-700 flex items-center gap-2">
                            ⏳ Menunggu Review ({pending.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pending.map((reg) => (
                            <ApproveRejectClient
                                key={reg.id}
                                registration={reg as Parameters<typeof ApproveRejectClient>[0]['registration']}
                                availableSessions={sessionsData.filter(
                                    (s) => s.course_id === (reg.course_master as { id: string } | null)?.id
                                ) as Parameters<typeof ApproveRejectClient>[0]['availableSessions']}
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* All Registrations Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Semua Pendaftaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/60 text-muted-foreground">
                                    <th className="text-left py-2.5 pr-4 font-medium">Nama</th>
                                    <th className="text-left py-2.5 pr-4 font-medium">Program</th>
                                    <th className="text-left py-2.5 pr-4 font-medium">Kategori</th>
                                    <th className="text-left py-2.5 pr-4 font-medium">Tanggal Daftar</th>
                                    <th className="text-left py-2.5 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {regData.map((reg) => {
                                    const badge = STATUS_BADGE[reg.status] ?? STATUS_BADGE.DRAFT
                                    return (
                                        <tr key={reg.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="py-3 pr-4">
                                                <div>
                                                    <p className="font-medium">{reg.full_name}</p>
                                                    {reg.reg_number && (
                                                        <p className="text-xs text-muted-foreground">{reg.reg_number}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {(reg.course_master as { name: string } | null)?.name ?? '—'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="outline" className="text-xs">{reg.participant_category}</Badge>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {new Date(reg.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="py-3">
                                                <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {regData.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                Belum ada pendaftar.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
