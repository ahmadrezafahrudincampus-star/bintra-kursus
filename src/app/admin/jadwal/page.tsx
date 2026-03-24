import { createClient } from '@/lib/supabase/server'
import { JadwalClient } from './_components/JadwalClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manajemen Jadwal | Admin' }

type SessionRow = {
    id: string
    name: string
    course_id: string
    instructor_name: string | null
    room: string | null
    day_of_week: string
    start_time: string
    end_time: string
    max_capacity: number
    current_count: number
    is_active: boolean
    course_master: { id: string; name: string; level: string } | null
    student_enrollments: { id: string; status: string }[] | null
}

type CourseRow = {
    id: string
    name: string
    level: string
}

const DAY_ORDER: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7,
}

export default async function AdminJadwalPage() {
    const supabase = await createClient()

    const [{ data: sessionRows, error: sessionError }, { data: courseRows, error: courseError }] =
        await Promise.all([
            supabase
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
                    current_count,
                    is_active,
                    course_master(id, name, level),
                    student_enrollments(id, status)
                `)
                .returns<SessionRow[]>(),
            supabase
                .from('course_master')
                .select('id, name, level')
                .order('name')
                .returns<CourseRow[]>(),
        ])

    if (sessionError) {
        console.error('Error fetching sessions:', sessionError)
    }

    if (courseError) {
        console.error('Error fetching courses:', courseError)
    }

    const sessions = (sessionRows ?? [])
        .map((session) => ({
            id: session.id,
            name: session.name,
            course_id: session.course_id,
            course_name: session.course_master?.name ?? 'Program tidak ditemukan',
            course_level: session.course_master?.level ?? 'pemula',
            instructor_name: session.instructor_name ?? '',
            room: session.room ?? 'Lab Komputer',
            day_of_week: session.day_of_week,
            start_time: session.start_time,
            end_time: session.end_time,
            max_capacity: session.max_capacity,
            current_count:
                session.student_enrollments?.filter(
                    (enrollment) => enrollment.status === 'ACTIVE'
                ).length ?? session.current_count ?? 0,
            is_active: session.is_active,
        }))
        .sort((left, right) => {
            const dayCompare =
                (DAY_ORDER[left.day_of_week] ?? 99) - (DAY_ORDER[right.day_of_week] ?? 99)

            if (dayCompare !== 0) return dayCompare
            return left.start_time.localeCompare(right.start_time)
        })

    return (
        <div className="space-y-6 max-w-7xl">
            <div>
                <h1 className="h2 mb-1">Manajemen Jadwal</h1>
                <p className="body-sm text-muted-foreground">
                    Buat sesi kelas baru, kelola kapasitas, dan pastikan tidak ada bentrok jadwal di lab komputer.
                </p>
            </div>

            <JadwalClient initialSessions={sessions} courses={courseRows ?? []} />
        </div>
    )
}
