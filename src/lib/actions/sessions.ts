'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

export type SessionFormInput = {
    course_id: string
    name: string
    instructor_name?: string
    day_of_week: string
    start_time: string
    end_time: string
    max_capacity: number
    room?: string
}

type SessionConflictRow = {
    id: string
    name: string
    day_of_week: string
    start_time: string
    end_time: string
    is_active: boolean
}

function normalizeTime(value: string) {
    if (!value) return ''
    return value.length === 5 ? `${value}:00` : value
}

function isOverlapping(
    startA: string,
    endA: string,
    startB: string,
    endB: string
) {
    return startA < endB && startB < endA
}

async function assertSuperAdmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { supabase, user: null, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()

    if (profile?.role !== 'super_admin') {
        return { supabase, user: null, error: 'Unauthorized' }
    }

    return { supabase, user, error: null }
}

async function findScheduleConflict(
    supabase: Awaited<ReturnType<typeof createClient>>,
    input: SessionFormInput,
    excludedId?: string
) {
    const startTime = normalizeTime(input.start_time)
    const endTime = normalizeTime(input.end_time)

    const { data, error } = await supabase
        .from('sessions')
        .select('id, name, day_of_week, start_time, end_time, is_active')
        .eq('day_of_week', input.day_of_week)
        .eq('is_active', true)
        .returns<SessionConflictRow[]>()

    if (error) {
        return { error: error.message }
    }

    const conflict = (data ?? []).find((session) => {
        if (excludedId && session.id === excludedId) {
            return false
        }

        return isOverlapping(
            startTime,
            endTime,
            session.start_time,
            session.end_time
        )
    })

    return { conflict }
}

function validateSessionInput(input: SessionFormInput) {
    if (!input.course_id) return 'Program kursus wajib dipilih.'
    if (!input.name.trim()) return 'Nama sesi wajib diisi.'
    if (!input.day_of_week) return 'Hari wajib dipilih.'
    if (!input.start_time || !input.end_time) return 'Jam mulai dan selesai wajib diisi.'
    if (normalizeTime(input.start_time) >= normalizeTime(input.end_time)) {
        return 'Jam selesai harus lebih besar dari jam mulai.'
    }
    if (input.max_capacity < 1) return 'Kapasitas minimal 1 siswa.'
    if (input.max_capacity > 50) return 'Kapasitas maksimal 50 siswa.'

    return null
}

export async function createSession(input: SessionFormInput) {
    const auth = await assertSuperAdmin()
    if (auth.error) return { error: auth.error }

    const validationError = validateSessionInput(input)
    if (validationError) return { error: validationError }

    const { conflict, error: conflictError } = await findScheduleConflict(
        auth.supabase,
        input
    )

    if (conflictError) return { error: conflictError }
    if (conflict) {
        return {
            error: `Jadwal bentrok dengan sesi aktif "${conflict.name}" (${conflict.day_of_week} ${conflict.start_time.slice(0, 5)}-${conflict.end_time.slice(0, 5)}).`,
        }
    }

    const payload: Database['public']['Tables']['sessions']['Insert'] = {
        course_id: input.course_id,
        name: input.name.trim(),
        instructor_name: input.instructor_name?.trim() || null,
        room: input.room?.trim() || 'Lab Komputer',
        day_of_week: input.day_of_week,
        start_time: normalizeTime(input.start_time),
        end_time: normalizeTime(input.end_time),
        max_capacity: input.max_capacity,
        is_active: true,
    }

    const { data, error } = await auth.supabase
        .from('sessions')
        .insert(payload as never)
        .select('id')
        .returns<{ id: string }[]>()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/jadwal')
    revalidatePath('/admin/sesi')
    if (data?.id) {
        revalidatePath(`/admin/sesi/${data.id}`)
    }

    return { success: true }
}

export async function updateSession(sessionId: string, input: SessionFormInput) {
    const auth = await assertSuperAdmin()
    if (auth.error) return { error: auth.error }

    const validationError = validateSessionInput(input)
    if (validationError) return { error: validationError }

    const { conflict, error: conflictError } = await findScheduleConflict(
        auth.supabase,
        input,
        sessionId
    )

    if (conflictError) return { error: conflictError }
    if (conflict) {
        return {
            error: `Jadwal bentrok dengan sesi aktif "${conflict.name}" (${conflict.day_of_week} ${conflict.start_time.slice(0, 5)}-${conflict.end_time.slice(0, 5)}).`,
        }
    }

    const payload: Database['public']['Tables']['sessions']['Update'] = {
        name: input.name.trim(),
        instructor_name: input.instructor_name?.trim() || null,
        room: input.room?.trim() || 'Lab Komputer',
        day_of_week: input.day_of_week,
        start_time: normalizeTime(input.start_time),
        end_time: normalizeTime(input.end_time),
        max_capacity: input.max_capacity,
    }

    const { error } = await auth.supabase
        .from('sessions')
        .update(payload as never)
        .eq('id', sessionId)

    if (error) return { error: error.message }

    revalidatePath('/admin/jadwal')
    revalidatePath('/admin/sesi')
    revalidatePath(`/admin/sesi/${sessionId}`)
    return { success: true }
}

export async function toggleSessionStatus(sessionId: string, isActive: boolean) {
    const auth = await assertSuperAdmin()
    if (auth.error) return { error: auth.error }

    if (isActive) {
        const { data: session } = await auth.supabase
            .from('sessions')
            .select('id, name, course_id, day_of_week, start_time, end_time, max_capacity, room, instructor_name')
            .eq('id', sessionId)
            .returns<{
                id: string
                name: string
                course_id: string
                day_of_week: string
                start_time: string
                end_time: string
                max_capacity: number
                room: string | null
                instructor_name: string | null
            }[]>()
            .single()

        if (!session) {
            return { error: 'Sesi tidak ditemukan.' }
        }

        const { conflict, error: conflictError } = await findScheduleConflict(
            auth.supabase,
            {
                course_id: session.course_id,
                name: session.name,
                day_of_week: session.day_of_week,
                start_time: session.start_time,
                end_time: session.end_time,
                max_capacity: session.max_capacity,
                room: session.room ?? 'Lab Komputer',
                instructor_name: session.instructor_name ?? '',
            },
            sessionId
        )

        if (conflictError) return { error: conflictError }
        if (conflict) {
            return {
                error: `Tidak bisa mengaktifkan sesi karena bentrok dengan "${conflict.name}".`,
            }
        }
    }

    const { error } = await auth.supabase
        .from('sessions')
        .update({ is_active: isActive } as never)
        .eq('id', sessionId)

    if (error) return { error: error.message }

    revalidatePath('/admin/jadwal')
    revalidatePath('/admin/sesi')
    revalidatePath(`/admin/sesi/${sessionId}`)
    return { success: true }
}

export async function deleteSession(sessionId: string) {
    const auth = await assertSuperAdmin()
    if (auth.error) return { error: auth.error }

    const { count, error: countError } = await auth.supabase
        .from('student_enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', 'ACTIVE')

    if (countError) return { error: countError.message }
    if ((count ?? 0) > 0) {
        return { error: 'Sesi tidak bisa dihapus karena masih memiliki siswa ACTIVE.' }
    }

    const { error } = await auth.supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

    if (error) return { error: error.message }

    revalidatePath('/admin/jadwal')
    revalidatePath('/admin/sesi')
    return { success: true }
}

export async function transferStudentSession(enrollmentId: string, targetSessionId: string) {
    const auth = await assertSuperAdmin()
    if (auth.error) return { error: auth.error }
    if (!auth.user) return { error: 'Unauthorized' }

    if (!targetSessionId) {
        return { error: 'Sesi tujuan wajib dipilih.' }
    }

    const { data: enrollment, error: enrollmentError } = await auth.supabase
        .from('student_enrollments')
        .select('id, profile_id, registration_id, session_id, status')
        .eq('id', enrollmentId)
        .returns<{
            id: string
            profile_id: string
            registration_id: string
            session_id: string
            status: 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
        }[]>()
        .single()

    if (enrollmentError || !enrollment) {
        return { error: 'Data enrollment siswa tidak ditemukan.' }
    }

    if (enrollment.status !== 'ACTIVE') {
        return { error: 'Hanya siswa ACTIVE yang bisa dipindahkan sesi.' }
    }

    if (enrollment.session_id === targetSessionId) {
        return { error: 'Siswa sudah berada di sesi tersebut.' }
    }

    const [{ data: registration }, { data: targetSession, error: targetSessionError }] =
        await Promise.all([
            auth.supabase
                .from('registrations')
                .select('course_id, full_name')
                .eq('id', enrollment.registration_id)
                .returns<{ course_id: string; full_name: string }[]>()
                .single(),
            auth.supabase
                .from('sessions')
                .select('id, name, course_id, is_active, current_count, max_capacity')
                .eq('id', targetSessionId)
                .returns<{
                    id: string
                    name: string
                    course_id: string
                    is_active: boolean
                    current_count: number
                    max_capacity: number
                }[]>()
                .single(),
        ])

    if (!registration) {
        return { error: 'Pendaftaran siswa tidak ditemukan.' }
    }

    if (targetSessionError || !targetSession) {
        return { error: 'Sesi tujuan tidak ditemukan.' }
    }

    if (!targetSession.is_active) {
        return { error: 'Sesi tujuan sedang nonaktif.' }
    }

    if (targetSession.course_id !== registration.course_id) {
        return { error: 'Sesi tujuan tidak sesuai dengan program kursus siswa.' }
    }

    if (targetSession.current_count >= targetSession.max_capacity) {
        return { error: 'Sesi tujuan sudah penuh.' }
    }

    const { error: updateError } = await auth.supabase
        .from('student_enrollments')
        .update({ session_id: targetSessionId } as never)
        .eq('id', enrollmentId)

    if (updateError) return { error: updateError.message }

    await auth.supabase.from('activity_logs').insert({
        actor_id: auth.user.id,
        action: 'STUDENT_TRANSFERRED_SESSION',
        target_type: 'student_enrollments',
        target_id: enrollmentId,
        details: {
            profile_id: enrollment.profile_id,
            registration_id: enrollment.registration_id,
            target_session_id: targetSessionId,
            student_name: registration.full_name,
        },
    } as never)

    revalidatePath('/admin/siswa')
    revalidatePath('/admin/jadwal')
    revalidatePath('/admin/sesi')
    revalidatePath(`/admin/sesi/${enrollment.session_id}`)
    revalidatePath(`/admin/sesi/${targetSessionId}`)
    revalidatePath('/admin/absensi')
    return { success: true }
}
