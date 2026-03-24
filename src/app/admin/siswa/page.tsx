import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'
import { SiswaClient, type StudentListItem } from '@/components/admin/SiswaClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Siswa | Admin' }

type EnrollmentRow = {
    id: string
    participant_category: 'SMP' | 'SMA' | 'Umum'
    enrolled_at: string
    profiles: { id: string; full_name: string; phone: string | null } | null
    sessions: {
        id: string
        course_id: string
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        course_master: { name: string } | null
    } | null
}

type SessionOptionRow = {
    id: string
    course_id: string
    name: string
    day_of_week: string
    start_time: string
    end_time: string
    current_count: number
    max_capacity: number
}

export default async function AdminSiswaPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select(`
            id, participant_category, enrolled_at,
            profiles(id, full_name, phone),
            sessions(id, course_id, name, day_of_week, start_time, end_time, course_master(name))
        `)
        .eq('status', 'ACTIVE')
        .order('enrolled_at', { ascending: false })
        .returns<EnrollmentRow[]>()

    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, course_id, name, day_of_week, start_time, end_time, current_count, max_capacity')
        .eq('is_active', true)
        .returns<SessionOptionRow[]>()

    const students = (enrollments ?? []).map((enrollment) => ({
        enrollment_id: enrollment.id,
        profile_id: enrollment.profiles?.id ?? '',
        full_name: enrollment.profiles?.full_name ?? '-',
        phone: enrollment.profiles?.phone ?? null,
        participant_category: enrollment.participant_category,
        enrolled_at: enrollment.enrolled_at,
        current_session_id: enrollment.sessions?.id ?? '',
        course_id: enrollment.sessions?.course_id ?? '',
        session_name: enrollment.sessions?.name ?? '-',
        day_of_week: enrollment.sessions?.day_of_week ?? '-',
        start_time: enrollment.sessions?.start_time ?? '',
        end_time: enrollment.sessions?.end_time ?? '',
        course_name: enrollment.sessions?.course_master?.name ?? '-',
        open_invoices: 0,
    })) as StudentListItem[]

    const profileIds = students.map((student) => student.profile_id).filter(Boolean)

    const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('profile_id')
        .in('status', ['UNPAID', 'OVERDUE'])
        .in('profile_id', profileIds.length > 0 ? profileIds : ['__none__'])
        .returns<{ profile_id: string }[]>()

    const unpaidCountMap: Record<string, number> = {}
    for (const invoice of unpaidInvoices ?? []) {
        unpaidCountMap[invoice.profile_id] = (unpaidCountMap[invoice.profile_id] ?? 0) + 1
    }

    const studentsWithInvoice: StudentListItem[] = students.map((student) => ({
        ...student,
        open_invoices: unpaidCountMap[student.profile_id] ?? 0,
    }))

    const sessionOptionsByCourse = (sessions ?? []).reduce<
        Record<
            string,
            {
                id: string
                name: string
                day_of_week: string
                start_time: string
                end_time: string
                current_count: number
                max_capacity: number
            }[]
        >
    >((accumulator, session) => {
        const currentList = accumulator[session.course_id] ?? []
        currentList.push({
            id: session.id,
            name: session.name,
            day_of_week: session.day_of_week,
            start_time: session.start_time,
            end_time: session.end_time,
            current_count: session.current_count,
            max_capacity: session.max_capacity,
        })
        accumulator[session.course_id] = currentList
        return accumulator
    }, {})

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Siswa</h1>
                    <p className="text-muted-foreground mt-1">
                        Daftar semua siswa aktif yang sudah terdaftar ke sesi kelas.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">
                        {studentsWithInvoice.length} Siswa Aktif
                    </span>
                </div>
            </div>

            <Card>
                <CardContent className="p-5">
                    <SiswaClient students={studentsWithInvoice} sessionOptionsByCourse={sessionOptionsByCourse} />
                </CardContent>
            </Card>
        </div>
    )
}
