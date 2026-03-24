import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Calendar, ClipboardList, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionsForAdmin } from '@/lib/actions/attendance'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Rekap Absensi | Admin' }

type AttendanceRecapRow = {
    id: string
    name: string
    category: string
    stats: {
        total: number
        present: number
        sick: number
        permit: number
        absent: number
        percent: number
    }
}

type EnrollmentAttendanceRow = {
    id: string
    participant_category: string
    profiles: { full_name: string } | null
    attendances: { id: string; status: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT' }[] | null
}

export default async function RekapAbsensiPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string }>
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''

    const sessions = await getSessionsForAdmin()
    const selectedSessionData = sessions.find((session) => session.id === selectedSession)

    let records: AttendanceRecapRow[] = []

    if (selectedSession) {
        const { data: enrollments } = await supabase
            .from('student_enrollments')
            .select(`
                id,
                participant_category,
                profiles(full_name),
                attendances(id, status)
            `)
            .eq('session_id', selectedSession)
            .eq('status', 'ACTIVE')

        if (enrollments) {
            records = (enrollments as EnrollmentAttendanceRow[]).map((enrollment) => {
                const attendances = enrollment.attendances || []
                const total = attendances.length
                const present = attendances.filter((attendance) => attendance.status === 'PRESENT').length
                const sick = attendances.filter((attendance) => attendance.status === 'SICK').length
                const permit = attendances.filter((attendance) => attendance.status === 'PERMIT').length
                const absent = attendances.filter((attendance) => attendance.status === 'ABSENT').length
                const percent = total === 0 ? 0 : Math.round((present / total) * 100)

                return {
                    id: enrollment.id,
                    name: enrollment.profiles?.full_name ?? '-',
                    category: enrollment.participant_category,
                    stats: { total, present, sick, permit, absent, percent },
                }
            })
            records.sort((a, b) => a.name.localeCompare(b.name))
        }
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="h2 mb-1">Rekap Absensi Siswa</h1>
                <p className="body-sm text-muted-foreground">
                    Lihat akumulasi kehadiran siswa per sesi kelas secara mendetail.
                </p>
            </div>

            <Card>
                <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Pilih Sesi Kelas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <form method="GET" className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex-1 space-y-1">
                            <label className="label-sm uppercase tracking-wider text-muted-foreground">Sesi Kelas</label>
                            <select
                                name="session"
                                defaultValue={selectedSession}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">-- Semua Sesi (Pilih Salah Satu) --</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.name} - {session.day_of_week} {session.start_time.slice(0, 5)}-{session.end_time.slice(0, 5)}
                                        {session.course_master ? ` (${session.course_master.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="h-[38px] rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-hover hover:bg-primary/90 hover:shadow-md"
                            >
                                Tampilkan Rekap
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {selectedSession ? (
                <Card>
                    <CardHeader className="border-b border-border/40 pb-3">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <CardTitle className="h5 flex items-center gap-2">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                    Hasil Rekap
                                </CardTitle>
                                {selectedSessionData ? (
                                    <CardDescription className="body-sm mt-1">
                                        Menampilkan rekap absensi untuk sesi <strong>{selectedSessionData.name}</strong>{' '}
                                        ({selectedSessionData.day_of_week}, Pukul {selectedSessionData.start_time.slice(0, 5)})
                                    </CardDescription>
                                ) : null}
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center gap-1.5 rounded border border-success/20 bg-success/10 px-2.5 py-1 font-medium text-success-foreground">Hadir: H</span>
                                <span className="flex items-center gap-1.5 rounded border border-warning/20 bg-warning/10 px-2.5 py-1 font-medium text-warning-foreground">Sakit: S / Izin: I</span>
                                <span className="flex items-center gap-1.5 rounded border border-destructive/20 bg-destructive/10 px-2.5 py-1 font-medium text-destructive-foreground">Alpha: A</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {records.length === 0 ? (
                            <div className="px-4 py-16 text-center text-muted-foreground">
                                <ClipboardList className="mx-auto mb-3 h-12 w-12 opacity-20" />
                                <p className="body-sm">Belum ada siswa aktif terdaftar di sesi ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/60 bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Nama Siswa</th>
                                            <th className="px-4 py-3 text-center font-medium">Tingkat</th>
                                            <th className="px-4 py-3 text-center font-medium">Total Input</th>
                                            <th className="px-4 py-3 text-center font-medium text-success-foreground">H</th>
                                            <th className="px-4 py-3 text-center font-medium text-warning-foreground">S / I</th>
                                            <th className="px-4 py-3 text-center font-medium text-destructive-foreground">A</th>
                                            <th className="px-4 py-3 text-right font-medium">% Hadir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {records.map((record, index) => (
                                            <tr key={record.id} className="transition-colors hover:bg-muted/30">
                                                <td className="px-4 py-3 font-medium">
                                                    {index + 1}. {record.name}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant="outline" className="px-2 text-[10px] font-normal">
                                                        {record.category}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">{record.stats.total}</td>
                                                <td className="px-4 py-3 text-center font-medium">{record.stats.present}</td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {record.stats.sick} / {record.stats.permit}
                                                </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">{record.stats.absent}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span
                                                        className={cn(
                                                            'font-bold',
                                                            record.stats.percent >= 80
                                                                ? 'text-success-foreground'
                                                                : record.stats.percent >= 60
                                                                  ? 'text-warning-foreground'
                                                                  : 'text-destructive-foreground'
                                                        )}
                                                    >
                                                        {record.stats.percent}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center text-muted-foreground">
                    <Calendar className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <h3 className="h5 mb-1">Pilih Sesi</h3>
                    <p className="body-sm">Pilih sesi kelas pada filter di atas untuk melihat rekapitulasi nilai absensi.</p>
                </div>
            )}
        </div>
    )
}
