import { redirect } from 'next/navigation'
import { ClipboardList, Clock3 } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PendaftarClient, type RegistrationListItem } from '@/components/admin/PendaftarClient'
import type { SessionAssignmentOption } from '@/components/admin/ApproveRejectClient'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Kelola Pendaftar' }

type RegistrationRow = {
    id: string
    full_name: string
    reg_number: string | null
    gender: 'L' | 'P'
    phone: string
    email: string | null
    address: string
    school_name: string
    participant_category: 'SMP' | 'SMA' | 'Umum'
    class_name: string | null
    parent_name: string | null
    parent_phone: string | null
    experience: string | null
    goals: string | null
    preferred_session_id: string | null
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
    rejection_reason: string | null
    created_at: string
    updated_at: string
    course_master: { id: string; name: string } | null
    sessions: {
        id: string
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        current_count: number
        max_capacity: number
    } | null
}

type SessionRow = SessionAssignmentOption & {
    course_id: string
}

export default async function AdminPendaftarPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: registrations } = await supabase
        .from('registrations')
        .select(`
            id,
            full_name,
            reg_number,
            gender,
            phone,
            email,
            address,
            school_name,
            participant_category,
            class_name,
            parent_name,
            parent_phone,
            experience,
            goals,
            preferred_session_id,
            status,
            rejection_reason,
            created_at,
            updated_at,
            course_master(id, name),
            sessions(id, name, day_of_week, start_time, end_time, current_count, max_capacity)
        `)
        .order('created_at', { ascending: false })
        .returns<RegistrationRow[]>()

    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, name, day_of_week, start_time, end_time, current_count, max_capacity, course_id')
        .eq('is_active', true)
        .returns<SessionRow[]>()

    const registrationItems: RegistrationListItem[] = (registrations ?? []).map((registration) => ({
        id: registration.id,
        full_name: registration.full_name,
        reg_number: registration.reg_number,
        gender: registration.gender,
        phone: registration.phone,
        email: registration.email,
        address: registration.address,
        school_name: registration.school_name,
        participant_category: registration.participant_category,
        class_name: registration.class_name,
        parent_name: registration.parent_name,
        parent_phone: registration.parent_phone,
        experience: registration.experience,
        goals: registration.goals,
        course_master: registration.course_master,
        preferred_session_id: registration.preferred_session_id,
        status: registration.status,
        rejection_reason: registration.rejection_reason,
        created_at: registration.created_at,
        updated_at: registration.updated_at,
        assigned_session: registration.sessions,
    }))

    const sessionsByCourse = (sessions ?? []).reduce<Record<string, SessionAssignmentOption[]>>(
        (accumulator, session) => {
            const currentSessions = accumulator[session.course_id] ?? []
            currentSessions.push({
                id: session.id,
                name: session.name,
                day_of_week: session.day_of_week,
                start_time: session.start_time,
                end_time: session.end_time,
                current_count: session.current_count,
                max_capacity: session.max_capacity,
            })
            accumulator[session.course_id] = currentSessions
            return accumulator
        },
        {}
    )

    const pendingCount = registrationItems.filter(
        (registration) => registration.status === 'PENDING'
    ).length

    return (
        <div className="max-w-6xl space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Pendaftar</h1>
                    <p className="mt-1 text-muted-foreground">
                        Review calon siswa, assign ke sesi yang tepat, lalu lanjutkan ke pengelolaan siswa aktif.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <Clock3 className="h-5 w-5 text-orange-600" />
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Menunggu Review
                                </p>
                                <p className="text-lg font-semibold">{pendingCount}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <ClipboardList className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Total Pendaftaran
                                </p>
                                <p className="text-lg font-semibold">{registrationItems.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PendaftarClient registrations={registrationItems} sessionsByCourse={sessionsByCourse} />
        </div>
    )
}
