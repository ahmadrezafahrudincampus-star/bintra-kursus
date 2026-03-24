import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Fingerprint, ShieldCheck, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { LogsAdminClient, type LogListItem } from '@/components/admin/LogsAdminClient'

export const metadata: Metadata = { title: 'Log Aktivitas' }

type LogRow = {
    id: string
    action: string
    target_type: string | null
    target_id: string | null
    created_at: string
    details: Record<string, unknown> | null
    profiles: { full_name: string } | null
}

function formatAction(action: string) {
    return action
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export default async function AdminLogsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: logs } = await supabase
        .from('activity_logs')
        .select(`
            id,
            action,
            target_type,
            target_id,
            details,
            created_at,
            profiles:actor_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)
        .returns<LogRow[]>()

    const logList = logs ?? []
    const logItems: LogListItem[] = logList.map((log) => ({
        id: log.id,
        action: log.action,
        target_type: log.target_type,
        target_id: log.target_id,
        created_at: log.created_at,
        details: log.details,
        actor_name: log.profiles?.full_name ?? null,
    }))
    const today = new Date().toISOString().slice(0, 10)

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold">Log Aktivitas</h1>
                <p className="text-muted-foreground mt-1">
                    Audit trail ini membantu admin meninjau perubahan penting yang terjadi di sistem.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: 'Log Ditampilkan', value: logList.length, icon: Activity },
                    { label: 'Aktivitas Hari Ini', value: logList.filter((log) => log.created_at.slice(0, 10) === today).length, icon: ShieldCheck },
                    { label: 'Pengguna Aktif', value: new Set(logList.map((log) => log.profiles?.full_name).filter(Boolean)).size, icon: Users },
                    { label: 'Jenis Aksi', value: new Set(logList.map((log) => log.action)).size, icon: Fingerprint },
                ].map((item) => {
                    const Icon = item.icon
                    return (
                        <Card key={item.label}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                                        <p className="text-2xl font-bold mt-1">{item.value}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle>Riwayat Aktivitas Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <LogsAdminClient logs={logItems} />
                </CardContent>
            </Card>
        </div>
    )
}
