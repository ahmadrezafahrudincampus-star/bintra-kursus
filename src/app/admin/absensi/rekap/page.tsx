import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Filter, Calendar } from 'lucide-react'
import { getSessionsForAdmin } from '@/lib/actions/attendance'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Rekap Absensi | Admin' }

export default async function RekapAbsensiPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''

    const sessions = await getSessionsForAdmin()
    const selectedSessionData = sessions.find((s) => s.id === selectedSession)

    // Ambil data murid dan absensi mereka jika sesi dipilih
    let records: any[] = []

    if (selectedSession) {
        const { data: enrollments } = await supabase
            .from('student_enrollments')
            .select(`
                id,
                participant_category,
                profiles ( full_name ),
                attendances ( id, status )
            `)
            .eq('session_id', selectedSession)
            .eq('status', 'ACTIVE')

        if (enrollments) {
            records = enrollments.map((e: any) => {
                const attendances = e.attendances || []
                const total = attendances.length
                const present = attendances.filter((a: any) => a.status === 'PRESENT').length
                const sick = attendances.filter((a: any) => a.status === 'SICK').length
                const permit = attendances.filter((a: any) => a.status === 'PERMIT').length
                const absent = attendances.filter((a: any) => a.status === 'ABSENT').length
                const percent = total === 0 ? 0 : Math.round((present / total) * 100)

                return {
                    id: e.id,
                    name: e.profiles?.full_name ?? '—',
                    category: e.participant_category,
                    stats: { total, present, sick, permit, absent, percent }
                }
            })
            // Sort by name
            records.sort((a, b) => a.name.localeCompare(b.name))
        }
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="h2 mb-1">Rekap Absensi Siswa</h1>
                <p className="body-sm text-muted-foreground">
                    Lihat akumulasi kehadiran siswa per sesi kelas secara mendetail.
                </p>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Pilih Sesi Kelas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <form method="GET" className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="label-sm text-muted-foreground uppercase tracking-wider">Sesi Kelas</label>
                            <select
                                name="session"
                                defaultValue={selectedSession}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                            >
                                <option value="">-- Semua Sesi (Pilih Salah Satu) --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} · {s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                                        {s.course_master ? ` (${s.course_master.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="px-5 py-2 h-[38px] bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-hover hover:bg-primary/90 hover:shadow-md"
                            >
                                Tampilkan Rekap
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Data Rekap */}
            {selectedSession ? (
                <Card>
                    <CardHeader className="pb-3 border-b border-border/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <CardTitle className="h5 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-primary" />
                                    Hasil Rekap
                                </CardTitle>
                                {selectedSessionData && (
                                    <CardDescription className="mt-1 body-sm">
                                        Menampilkan rekap absensi untuk sesi <strong>{selectedSessionData.name}</strong>
                                        {' '}({selectedSessionData.day_of_week}, Pukul {selectedSessionData.start_time.slice(0, 5)})
                                    </CardDescription>
                                )}
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 text-success-foreground border border-success/20 font-medium">Hadir: H</span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning/10 text-warning-foreground border border-warning/20 font-medium">Sakit: S / Izin: I</span>
                                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-destructive/10 text-destructive-foreground border border-destructive/20 font-medium">Alpha: A</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {records.length === 0 ? (
                            <div className="text-center py-16 text-muted-foreground px-4">
                                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="body-sm">Belum ada siswa aktif terdaftar di sesi ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 border-b border-border/60">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Nama Siswa</th>
                                            <th className="px-4 py-3 font-medium text-center">Tingkat</th>
                                            <th className="px-4 py-3 font-medium text-center">Total Input</th>
                                            <th className="px-4 py-3 font-medium text-center text-success-foreground">H</th>
                                            <th className="px-4 py-3 font-medium text-center text-warning-foreground">S / I</th>
                                            <th className="px-4 py-3 font-medium text-center text-destructive-foreground">A</th>
                                            <th className="px-4 py-3 font-medium text-right">% Hadir</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/60">
                                        {records.map((r, i) => (
                                            <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-medium">
                                                    {i + 1}. {r.name}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <Badge variant="outline" className="font-normal text-[10px] px-2">{r.category}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">{r.stats.total}</td>
                                                <td className="px-4 py-3 text-center font-medium">{r.stats.present}</td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">
                                                    {r.stats.sick} / {r.stats.permit}
                                                </td>
                                                <td className="px-4 py-3 text-center text-muted-foreground">{r.stats.absent}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={cn(
                                                        "font-bold",
                                                        r.stats.percent >= 80 ? "text-success-foreground" :
                                                            r.stats.percent >= 60 ? "text-warning-foreground" :
                                                                "text-destructive-foreground"
                                                    )}>
                                                        {r.stats.percent}%
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
                <div className="text-center py-16 text-muted-foreground bg-muted/20 border border-dashed border-border/80 rounded-2xl">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <h3 className="h5 mb-1">Pilih Sesi</h3>
                    <p className="body-sm">Pilih sesi kelas pada filter di atas untuk melihat rekapitulasi nilai absensi.</p>
                </div>
            )}
        </div>
    )
}
