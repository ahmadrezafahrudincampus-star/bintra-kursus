import { redirect } from 'next/navigation'
import { getMyAttendance } from '@/lib/actions/attendance'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCheck, TrendingUp, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Absensi Saya | Dashboard' }

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
    PRESENT: { label: 'Hadir', cls: 'bg-green-100 text-green-700' },
    ABSENT: { label: 'Absen', cls: 'bg-red-100 text-red-700' },
    SICK: { label: 'Sakit', cls: 'bg-yellow-100 text-yellow-700' },
    PERMIT: { label: 'Izin', cls: 'bg-blue-100 text-blue-700' },
}

export default async function DashboardAbsensiPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const records = await getMyAttendance()

    const total = records.length
    const hadir = records.filter((r) => r.status === 'PRESENT').length
    const persentase = total > 0 ? Math.round((hadir / total) * 100) : 0

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold">Absensi Saya</h1>
                <p className="text-muted-foreground mt-1">Riwayat kehadiran kelas kamu</p>
            </div>

            {/* Statistik */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{total}</p>
                        <p className="text-xs text-muted-foreground mt-1">Total Pertemuan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{hadir}</p>
                        <p className="text-xs text-muted-foreground mt-1">Kali Hadir</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className={`text-2xl font-bold ${persentase >= 80 ? 'text-green-600' : persentase >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {persentase}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Kehadiran</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ringkasan */}
            {total > 0 && (
                <div className="flex gap-2 flex-wrap text-xs">
                    {Object.entries(STATUS_STYLE).map(([key, val]) => {
                        const count = records.filter((r) => r.status === key).length
                        if (count === 0) return null
                        return (
                            <span key={key} className={`px-2.5 py-1 rounded-full font-medium ${val.cls}`}>
                                {val.label}: {count}
                            </span>
                        )
                    })}
                </div>
            )}

            {/* Progress bar */}
            {total > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Kehadiran</span>
                        <span>{hadir}/{total} pertemuan</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${persentase >= 80 ? 'bg-green-500' : persentase >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${persentase}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Tabel riwayat */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Riwayat Pertemuan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Belum ada data absensi.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                                <div className="col-span-5">Tanggal</div>
                                <div className="col-span-3">Pertemuan</div>
                                <div className="col-span-3">Status</div>
                                <div className="col-span-1"></div>
                            </div>
                            {records.map((r) => {
                                const style = STATUS_STYLE[r.status] ?? { label: r.status, cls: 'bg-gray-100 text-gray-700' }
                                return (
                                    <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors items-center">
                                        <div className="col-span-5 text-sm">
                                            {new Date(r.date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="col-span-3 text-sm text-muted-foreground">
                                            Ke-{r.meeting_number}
                                        </div>
                                        <div className="col-span-3">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.cls}`}>
                                                {style.label}
                                            </span>
                                        </div>
                                        <div className="col-span-1"></div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
