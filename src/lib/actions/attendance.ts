'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Attendance } from '@/types/database'

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'

export interface SessionStudent {
    enrollment_id: string
    profile_id: string
    full_name: string
    participant_category: string
}

export interface AttendanceBatchRecord {
    enrollment_id: string
    status: AttendanceStatus
    notes?: string
}

/** Admin: ambil semua sesi aktif untuk dropdown input absensi */
export async function getSessionsForAdmin() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('sessions')
        .select('id, name, day_of_week, start_time, end_time, course_master(name)')
        .eq('is_active', true)
        .order('day_of_week')
        .returns<{
            id: string
            name: string
            day_of_week: string
            start_time: string
            end_time: string
            course_master: { name: string } | null
        }[]>()

    return data ?? []
}

/** Admin: ambil daftar siswa aktif per sesi */
export async function getSessionStudents(sessionId: string): Promise<SessionStudent[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('student_enrollments')
        .select('id, profile_id, participant_category, profiles(full_name)')
        .eq('session_id', sessionId)
        .eq('status', 'ACTIVE')
        .returns<any[]>()

    if (!data) return []

    return data.map((e: any) => ({
        enrollment_id: e.id,
        profile_id: e.profile_id,
        full_name: e.profiles?.full_name ?? '—',
        participant_category: e.participant_category,
    }))
}

/** Admin: ambil daftar pertemuan (meeting) yang sudah diinput untuk sesi tertentu */
export async function getAttendanceMeetings(sessionId: string): Promise<{ date: string; meeting_number: number }[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('attendances')
        .select('date, meeting_number')
        .eq('session_id', sessionId)
        .order('date', { ascending: false })
        .order('meeting_number', { ascending: false })
        .returns<{ date: string; meeting_number: number }[]>()

    if (!data) return []

    // Unique combination
    const seen = new Set<string>()
    return data.filter((row) => {
        const key = `${row.date}__${row.meeting_number}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

/** Admin: ambil absensi per sesi+tanggal+meeting untuk mode edit */
export async function getAttendanceByMeeting(
    sessionId: string,
    date: string,
    meetingNumber: number
): Promise<{ enrollment_id: string; status: string; notes: string | null }[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('attendances')
        .select('enrollment_id, status, notes')
        .eq('session_id', sessionId)
        .eq('date', date)
        .eq('meeting_number', meetingNumber)
        .returns<{ enrollment_id: string; status: string; notes: string | null }[]>()

    return data ?? []
}

/** Admin: simpan batch absensi satu sesi, satu hari, satu meeting_number
 *  Upsert dengan conflict: enrollment_id + date + meeting_number
 */
export async function submitAttendance(
    sessionId: string,
    date: string,
    meetingNumber: number,
    records: AttendanceBatchRecord[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()
    if (profile?.role !== 'super_admin') return { error: 'Unauthorized' }

    const rows = records.map((r) => ({
        enrollment_id: r.enrollment_id,
        session_id: sessionId,
        date,
        meeting_number: meetingNumber,
        status: r.status,
        notes: r.notes ?? null,
        recorded_by: user.id,
    }))

    const { error } = await supabase
        .from('attendances')
        .upsert(rows as any, { onConflict: 'enrollment_id,date,meeting_number' })

    if (error) return { error: error.message }

    revalidatePath('/admin/absensi')
    revalidatePath('/dashboard/absensi')
    return { success: true }
}

/** Siswa: ambil histori absensi milik enrollment aktif */
export async function getMyAttendance(): Promise<Pick<Attendance, 'id' | 'date' | 'meeting_number' | 'status' | 'notes'>[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{ id: string }[]>()
        .maybeSingle()

    if (!enrollment) return []

    const { data } = await supabase
        .from('attendances')
        .select('id, date, meeting_number, status, notes')
        .eq('enrollment_id', enrollment.id)
        .order('date', { ascending: false })
        .order('meeting_number', { ascending: false })
        .returns<Pick<Attendance, 'id' | 'date' | 'meeting_number' | 'status' | 'notes'>[]>()

    return data ?? []
}
