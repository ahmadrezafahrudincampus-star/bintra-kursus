import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Filter, ScrollText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSessionsForAdmin } from '@/lib/actions/attendance'
import { PrintPageButton } from '@/components/admin/PrintPageButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Template Absensi | Admin' }

type PrintableStudent = {
    id: string
    name: string
    category: string
}

type EnrollmentTemplateRow = {
    id: string
    profiles: { full_name: string } | null
    participant_category: string
}

export default async function AdminTemplateAbsenPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string; month?: string }>
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const selectedMonth = params.month ?? currentMonth

    const sessions = await getSessionsForAdmin()
    const selectedSessionData = sessions.find((session) => session.id === selectedSession)

    let students: PrintableStudent[] = []
    if (selectedSession) {
        const { data } = await supabase
            .from('student_enrollments')
            .select(`
                id,
                profiles(full_name),
                participant_category
            `)
            .eq('session_id', selectedSession)
            .eq('status', 'ACTIVE')

        if (data) {
            students = (data as EnrollmentTemplateRow[])
                .map((row) => ({
                    id: row.id,
                    name: row.profiles?.full_name ?? '-',
                    category: row.participant_category,
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
        }
    }

    const [year, monthNum] = selectedMonth.split('-')
    const monthName = new Date(
        Number.parseInt(year, 10),
        Number.parseInt(monthNum, 10) - 1,
        1
    ).toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric',
    })

    const MAX_MEETINGS = 5

    return (
        <div className="mx-auto max-w-5xl space-y-6 print:m-0 print:max-w-none print:space-y-0">
            <div className="no-print">
                <h1 className="h2 mb-1">Cetak Template Absensi</h1>
                <p className="body-sm text-muted-foreground">
                    Buat dan cetak lembar daftar hadir kosong untuk diisi secara manual di kelas.
                </p>
            </div>

            <Card className="no-print">
                <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Konfigurasi Cetak
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 pt-5 sm:flex-row">
                    <form method="GET" className="flex flex-1 flex-col gap-3 sm:flex-row">
                        <div className="flex-1 space-y-1">
                            <label className="label-sm uppercase tracking-wider text-muted-foreground">Sesi Kelas</label>
                            <select
                                name="session"
                                defaultValue={selectedSession}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">-- Pilih Sesi --</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>
                                        {session.name} - {session.day_of_week}
                                        {session.course_master ? ` (${session.course_master.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="label-sm uppercase tracking-wider text-muted-foreground">Bulan</label>
                            <input
                                type="month"
                                name="month"
                                defaultValue={selectedMonth}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="h-[38px] rounded-lg border border-border bg-secondary px-5 py-2 text-sm font-medium text-secondary-foreground transition-hover hover:bg-secondary/80"
                            >
                                Tampilkan Preview
                            </button>
                        </div>
                    </form>

                    {selectedSession ? (
                        <div className="flex items-end border-border/60 pt-3 sm:border-l sm:pl-4 sm:pt-0">
                            <PrintPageButton className="flex h-[38px] items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-hover hover:bg-primary/90 hover:shadow-md" />
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {selectedSession ? (
                <div className="rounded-xl border border-border/40 bg-white p-8 text-black shadow-sm print:border-none print:p-0 print:shadow-none sm:p-12">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold uppercase tracking-wider">Daftar Hadir Siswa</h2>
                        <p className="mt-1 text-lg font-medium">{selectedSessionData?.course_master?.name}</p>
                        <p className="mt-1 text-sm text-gray-600">Bulan: {monthName}</p>
                    </div>

                    <div className="mb-6 grid grid-cols-2 gap-4 border border-black bg-gray-50/50 p-4 text-sm font-medium print:bg-transparent lg:grid-cols-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Sesi Kelas:</span>
                            <span>{selectedSessionData?.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Instruktur:</span>
                            <span>_____________________</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Jadwal:</span>
                            <span>
                                {selectedSessionData?.day_of_week}, Pukul {selectedSessionData?.start_time.slice(0, 5)}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Ruangan:</span>
                            <span>_____________________</span>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-black text-sm">
                        <thead className="bg-gray-100 print:bg-transparent">
                            <tr>
                                <th rowSpan={2} className="w-10 border border-black p-2 text-center">
                                    No
                                </th>
                                <th rowSpan={2} className="w-56 border border-black p-2 text-left">
                                    Nama Lengkap
                                </th>
                                <th rowSpan={2} className="w-16 border border-black p-2 text-center">
                                    Tingkat
                                </th>
                                <th colSpan={MAX_MEETINGS} className="border border-black p-2 text-center">
                                    Tanggal Pertemuan
                                </th>
                                <th rowSpan={2} className="w-24 border border-black p-2 text-center">
                                    Keterangan
                                </th>
                            </tr>
                            <tr>
                                {Array.from({ length: MAX_MEETINGS }).map((_, index) => (
                                    <th
                                        key={index}
                                        className="h-8 w-16 border border-black border-t-0 p-2 text-center font-normal text-gray-400"
                                    >
                                        _ / _
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={student.id}>
                                        <td className="border border-black p-2 text-center">{index + 1}</td>
                                        <td className="border border-black p-2 font-medium">{student.name}</td>
                                        <td className="border border-black p-2 text-center text-xs">{student.category}</td>
                                        {Array.from({ length: MAX_MEETINGS }).map((_, cellIndex) => (
                                            <td key={cellIndex} className="border border-black p-2" />
                                        ))}
                                        <td className="border border-black p-2" />
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={MAX_MEETINGS + 4} className="border border-black p-8 text-center text-gray-500">
                                        Tidak ada siswa aktif terdaftar di sesi kelas ini.
                                    </td>
                                </tr>
                            )}

                            {Array.from({ length: 3 }).map((_, index) => (
                                <tr key={`empty-${index}`}>
                                    <td className="border border-black p-2 text-center text-transparent">X</td>
                                    <td className="border border-black p-2" />
                                    <td className="border border-black p-2" />
                                    {Array.from({ length: MAX_MEETINGS }).map((_, cellIndex) => (
                                        <td key={cellIndex} className="border border-black p-2" />
                                    ))}
                                    <td className="border border-black p-2" />
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-8 flex justify-end print:absolute print:bottom-8 print:right-8">
                        <div className="text-center">
                            <p className="text-sm">Mengetahui,</p>
                            <div className="h-16" />
                            <p className="border-t border-black px-4 pt-1 text-sm font-bold">( Pengajar Utama )</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-print rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center text-muted-foreground">
                    <ScrollText className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <h3 className="h5 mb-1">Preview Lembar Kosong</h3>
                    <p className="body-sm">
                        Pilih sesi kelas dari form di atas untuk men-generate layout absensi yang siap cetak (A4/F4).
                    </p>
                </div>
            )}
        </div>
    )
}
