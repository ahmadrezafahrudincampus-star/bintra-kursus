import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Printer, Filter, ScrollText } from 'lucide-react'
import { getSessionsForAdmin } from '@/lib/actions/attendance'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Template Absensi | Admin' }

export default async function AdminTemplateAbsenPage({
    searchParams
}: {
    searchParams: Promise<{ session?: string, month?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''

    // Default to current month YYYY-MM
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const selectedMonth = params.month ?? currentMonth

    const sessions = await getSessionsForAdmin()
    const selectedSessionData = sessions.find((s) => s.id === selectedSession)

    let students: any[] = []
    if (selectedSession) {
        const { data } = await supabase
            .from('student_enrollments')
            .select(`
                id,
                profiles ( full_name ),
                participant_category
            `)
            .eq('session_id', selectedSession)
            .eq('status', 'ACTIVE')

        if (data) {
            students = data.map((d: any) => ({
                id: d.id,
                name: d.profiles?.full_name ?? '—',
                category: d.participant_category,
            }))
            // Sort by name
            students.sort((a, b) => a.name.localeCompare(b.name))
        }
    }

    // Convert selectedMonth to human readable format
    const [year, monthNum] = selectedMonth.split('-')
    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

    // Asumsikan dalam 1 bulan maksimal ada 5 pertemuan untuk 1 sesi (karena seminggu sekali)
    const MAX_MEETINGS = 5

    return (
        <div className="space-y-6 max-w-5xl mx-auto print:max-w-none print:m-0 print:space-y-0">
            {/* Header (No Print) */}
            <div className="no-print">
                <h1 className="h2 mb-1">Cetak Template Absensi</h1>
                <p className="body-sm text-muted-foreground">
                    Buat dan cetak lembar daftar hadir kosong untuk diisi secara manual di kelas.
                </p>
            </div>

            {/* Filter (No Print) */}
            <Card className="no-print">
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Konfigurasi Cetak
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col sm:flex-row gap-4">
                    <form method="GET" className="flex flex-1 flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="label-sm text-muted-foreground uppercase tracking-wider">Sesi Kelas</label>
                            <select
                                name="session"
                                defaultValue={selectedSession}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">-- Pilih Sesi --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} · {s.day_of_week}
                                        {s.course_master ? ` (${s.course_master.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="label-sm text-muted-foreground uppercase tracking-wider">Bulan</label>
                            <input
                                type="month"
                                name="month"
                                defaultValue={selectedMonth}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="px-5 py-2 h-[38px] bg-secondary text-secondary-foreground rounded-lg text-sm font-medium transition-hover hover:bg-secondary/80 border border-border"
                            >
                                Tampilkan Preview
                            </button>
                        </div>
                    </form>

                    {selectedSession && (
                        <div className="flex items-end pt-3 sm:pt-0 sm:border-l sm:pl-4 border-border/60">
                            {/* Tombol cetak memanggil window.print() - bisa ditaruh di client component kecil, atau kita siasati dengan onClick dari komponen turunan */}
                            <form action="javascript:window.print()">
                                <button
                                    type="submit"
                                    className="px-5 py-2 h-[38px] bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-hover hover:bg-primary/90 hover:shadow-md flex items-center gap-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    Cetak PDF
                                </button>
                            </form>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Preview Sheet (Printable) */}
            {selectedSession ? (
                <div className="bg-white text-black p-8 sm:p-12 border border-border/40 shadow-sm rounded-xl print:border-none print:shadow-none print:p-0">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Daftar Hadir Siswa</h2>
                        <p className="text-lg mt-1 font-medium">{selectedSessionData?.course_master?.name}</p>
                        <p className="text-sm text-gray-600 mt-1">Bulan: {monthName}</p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border border-black p-4 text-sm font-medium bg-gray-50/50 print:bg-transparent">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Sesi Kelas:</span>
                            <span>{selectedSessionData?.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Instruktur:</span>
                            <span>_____________________</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Jadwal:</span>
                            <span>{selectedSessionData?.day_of_week}, Pukul {selectedSessionData?.start_time.slice(0, 5)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Ruangan:</span>
                            <span>_____________________</span>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-sm">
                        <thead className="bg-gray-100 print:bg-transparent">
                            <tr>
                                <th rowSpan={2} className="border border-black p-2 w-10 text-center">No</th>
                                <th rowSpan={2} className="border border-black p-2 text-left w-56">Nama Lengkap</th>
                                <th rowSpan={2} className="border border-black p-2 text-center w-16">Tingkat</th>
                                <th colSpan={MAX_MEETINGS} className="border border-black p-2 text-center">Tanggal Pertemuan</th>
                                <th rowSpan={2} className="border border-black p-2 text-center w-24">Keterangan</th>
                            </tr>
                            <tr>
                                {Array.from({ length: MAX_MEETINGS }).map((_, i) => (
                                    <th key={i} className="border border-black p-2 h-8 text-center w-16 text-gray-400 font-normal border-t-0">_ / _</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? students.map((s, i) => (
                                <tr key={s.id}>
                                    <td className="border border-black p-2 text-center">{i + 1}</td>
                                    <td className="border border-black p-2 font-medium">{s.name}</td>
                                    <td className="border border-black p-2 text-center text-xs">{s.category}</td>
                                    {Array.from({ length: MAX_MEETINGS }).map((_, i) => (
                                        <td key={i} className="border border-black p-2"></td>
                                    ))}
                                    <td className="border border-black p-2"></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={MAX_MEETINGS + 4} className="border border-black p-8 text-center text-gray-500">
                                        Tidak ada siswa aktif terdaftar di sesi kelas ini.
                                    </td>
                                </tr>
                            )}
                            {/* Tambahan baris kosong untuk siswa susulan */}
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <tr key={`empty-${idx}`}>
                                    <td className="border border-black p-2 text-center text-transparent">X</td>
                                    <td className="border border-black p-2"></td>
                                    <td className="border border-black p-2"></td>
                                    {Array.from({ length: MAX_MEETINGS }).map((_, i) => (
                                        <td key={i} className="border border-black p-2"></td>
                                    ))}
                                    <td className="border border-black p-2"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-end print:absolute print:bottom-8 print:right-8">
                        <div className="text-center">
                            <p className="text-sm">Mengetahui,</p>
                            <div className="h-16"></div>
                            <p className="font-bold border-t border-black px-4 pt-1 text-sm">( Pengajar Utama )</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground bg-muted/20 border border-dashed border-border/80 rounded-2xl no-print">
                    <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <h3 className="h5 mb-1">Preview Lembat Kosong</h3>
                    <p className="body-sm">Pilih sesi kelas dari form di atas untuk men-generate layout absensi yang siap cetak (A4/F4).</p>
                </div>
            )}
        </div>
    )
}
