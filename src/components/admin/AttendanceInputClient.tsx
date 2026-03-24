'use client'

import { useState, useEffect, useTransition } from 'react'
import { getSessionStudents, getAttendanceByMeeting, submitAttendance } from '@/lib/actions/attendance'
import type { SessionStudent, AttendanceStatus, AttendanceBatchRecord } from '@/lib/actions/attendance'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
    { value: 'PRESENT', label: 'Hadir', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { value: 'ABSENT', label: 'Absen', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { value: 'SICK', label: 'Sakit', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { value: 'PERMIT', label: 'Izin', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
]

interface AttendanceClientProps {
    sessionId: string
    date: string
    meetingNumber: number
}

export function AttendanceInputClient({ sessionId, date, meetingNumber }: AttendanceClientProps) {
    const [students, setStudents] = useState<SessionStudent[]>([])
    const [records, setRecords] = useState<Record<string, AttendanceStatus>>({})
    const [loading, setLoading] = useState(true)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        setLoading(true)
        Promise.all([
            getSessionStudents(sessionId),
            getAttendanceByMeeting(sessionId, date, meetingNumber),
        ]).then(([sts, existing]) => {
            setStudents(sts)
            const initialRecords: Record<string, AttendanceStatus> = {}
            for (const s of sts) {
                const found = existing.find((e) => e.enrollment_id === s.enrollment_id)
                initialRecords[s.enrollment_id] = (found?.status as AttendanceStatus) ?? 'PRESENT'
            }
            setRecords(initialRecords)
            setLoading(false)
        })
    }, [sessionId, date, meetingNumber])

    const handleSubmit = () => {
        startTransition(async () => {
            const batch: AttendanceBatchRecord[] = students.map((s) => ({
                enrollment_id: s.enrollment_id,
                status: records[s.enrollment_id] ?? 'PRESENT',
            }))
            const result = await submitAttendance(sessionId, date, meetingNumber, batch)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(`Absensi pertemuan ${meetingNumber} berhasil disimpan!`)
            }
        })
    }

    if (loading) return (
        <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
    )

    if (students.length === 0) return (
        <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada siswa aktif di sesi ini.
        </div>
    )

    const stats = Object.values(records)
    const hadir = stats.filter((s) => s === 'PRESENT').length
    const absen = stats.filter((s) => s === 'ABSENT').length
    const sakit = stats.filter((s) => s === 'SICK').length
    const izin = stats.filter((s) => s === 'PERMIT').length

    return (
        <div className="space-y-4">
            {/* Ringkasan live */}
            <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Hadir: {hadir}</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Absen: {absen}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">Sakit: {sakit}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">Izin: {izin}</span>
            </div>

            {/* Daftar siswa */}
            <div className="space-y-2">
                {students.map((s, idx) => (
                    <div key={s.enrollment_id} className="flex items-center gap-3 py-2.5 px-3 border border-border/40 rounded-lg">
                        <span className="text-xs text-muted-foreground w-5 text-right">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{s.full_name}</p>
                            <p className="text-xs text-muted-foreground">{s.participant_category}</p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setRecords((prev) => ({ ...prev, [s.enrollment_id]: opt.value }))}
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border-2 ${records[s.enrollment_id] === opt.value
                                            ? `${opt.color} border-current`
                                            : 'bg-transparent text-muted-foreground hover:bg-muted border-transparent'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Absensi
            </Button>
        </div>
    )
}
