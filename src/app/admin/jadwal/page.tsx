import { createClient } from '@/lib/supabase/server'
import { JadwalClient } from './_components/JadwalClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manajemen Jadwal | Admin' }

export default async function AdminJadwalPage() {
    const supabase = await createClient()

    // Ambil data sessions beserta nama kursus dan jumlah siswa (jika bisa)
    // Menghitung jumlah record enrollment per sesi
    const { data: rawSessions, error } = await supabase
        .from('sessions')
        .select(`
            id,
            name,
            course_id,
            instructor_name,
            room,
            day_of_week,
            start_time,
            end_time,
            max_capacity,
            is_active,
            course_master ( id, name ),
            student_enrollments ( id, status )
        `)
    // Filter aktif agar tidak berat (bisa dihilangkan jika admin ingin melihat semua)
    // Kita ambil semua saja supaya admin bisa filter Active/Inactive.

    if (error) {
        console.error('Error fetching sessions:', error)
    }

    const sessions = (rawSessions ?? []).map((s: any) => {
        // Hitung siswa yang berstatus ACTIVE
        const activeStudents = s.student_enrollments?.filter(
            (e: any) => e.status === 'ACTIVE'
        ).length || 0

        return {
            id: s.id,
            name: s.name,
            course_id: s.course_id,
            course_name: s.course_master?.name || 'Unknown Course',
            instructor_name: s.instructor_name || 'Tidak ada',
            room: s.room || 'Belum diatur',
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            max_capacity: s.max_capacity,
            current_count: activeStudents,
            is_active: s.is_active,
        }
    })

    // Urutkan berdasarkan hari (Senin -> Minggu)
    const orderDay: Record<string, number> = {
        'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7
    }
    sessions.sort((a, b) => {
        const da = orderDay[a.day_of_week] || 99
        const db = orderDay[b.day_of_week] || 99
        if (da !== db) return da - db
        return a.start_time.localeCompare(b.start_time)
    })

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="h2 mb-1">Manajemen Jadwal</h1>
                <p className="body-sm text-muted-foreground">
                    Pantau dan kelola jadwal kelas, kapasitas, serta pengajar.
                </p>
            </div>

            <JadwalClient initialSessions={sessions} />
        </div>
    )
}
