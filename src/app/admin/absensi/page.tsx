import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSessionsForAdmin, getAttendanceMeetings } from '@/lib/actions/attendance'
import { AttendanceInputClient } from '@/components/admin/AttendanceInputClient'
import { ClipboardList, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Input Absensi | Admin' }

export default async function AdminAbsensiPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string; date?: string; meeting?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''
    const selectedDate = params.date ?? new Date().toISOString().split('T')[0]
    const selectedMeeting = parseInt(params.meeting ?? '1', 10) || 1

    const sessions = await getSessionsForAdmin()

    // Ambil riwayat pertemuan untuk sesi terpilih
    const meetings = selectedSession ? await getAttendanceMeetings(selectedSession) : []

    // Hitung meeting_number berikutnya (jika belum ada input baru)
    const existingMeetings = meetings.map((m) => m.meeting_number)
    const nextMeeting = existingMeetings.length > 0 ? Math.max(...existingMeetings) + 1 : 1

    const selectedSessionData = sessions.find((s) => s.id === selectedSession)

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Input Absensi</h1>
                <p className="text-muted-foreground mt-1">Catat kehadiran siswa per sesi dan pertemuan</p>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Pilih Sesi & Tanggal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form method="GET" className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Sesi Kelas</label>
                            <select
                                name="session"
                                defaultValue={selectedSession}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">-- Pilih Sesi --</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name} · {s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                                        {s.course_master ? ` (${s.course_master.name})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">Tanggal</label>
                            <input
                                type="date"
                                name="date"
                                defaultValue={selectedDate}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">No. Pertemuan</label>
                            <input
                                type="number"
                                name="meeting"
                                defaultValue={selectedMeeting}
                                min={1}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Tampilkan
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Riwayat pertemuan */}
            {selectedSession && meetings.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">Pertemuan yang Sudah Diinput</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {meetings.slice(0, 15).map((m) => (
                                <Link
                                    key={`${m.date}-${m.meeting_number}`}
                                    href={`?session=${selectedSession}&date=${m.date}&meeting=${m.meeting_number}`}
                                    className="text-xs px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 border border-border/60 transition-colors"
                                >
                                    Pertemuan {m.meeting_number} · {new Date(m.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Input absensi */}
            {selectedSession ? (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Absensi Pertemuan {selectedMeeting}
                            {selectedSessionData && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    · {selectedSessionData.name} · {new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AttendanceInputClient
                            sessionId={selectedSession}
                            date={selectedDate}
                            meetingNumber={selectedMeeting}
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Pilih sesi dan tanggal untuk mulai input absensi.</p>
                </div>
            )}
        </div>
    )
}
