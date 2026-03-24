'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/database'

type RegistrationRpcResponse = {
    success: boolean
    error?: string
}

function callRegistrationRpc(
    supabase: Awaited<ReturnType<typeof createClient>>,
    fn: string,
    args: Record<string, unknown>
) {
    return supabase.rpc(fn as never, args as never) as unknown as Promise<{
        data: RegistrationRpcResponse | null
        error: { message: string } | null
    }>
}

export async function submitRegistration(formData: {
    full_name: string
    gender: 'L' | 'P'
    birth_date: string
    phone: string
    email?: string
    address: string
    school_name: string
    participant_category: 'SMP' | 'SMA' | 'Umum'
    class_name?: string
    parent_name?: string
    parent_phone?: string
    course_id: string
    preferred_session_id?: string
    experience?: string
    goals?: string
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Silakan login terlebih dahulu.' }
    }

    // Cek apakah sudah ada pendaftaran aktif (selain REJECTED)
    const { data: existing } = await supabase
        .from('registrations')
        .select('id, status')
        .eq('profile_id', user.id)
        .neq('status', 'REJECTED')
        .returns<{ id: string; status: string }[]>()
        .maybeSingle()

    if (existing) {
        return {
            error: `Anda sudah memiliki pendaftaran dengan status ${existing.status}. Hubungi admin untuk informasi lebih lanjut.`,
        }
    }

    // Insert pendaftaran dengan status PENDING.
    // Reg number akan dibuat otomatis oleh trigger database.
    const payload: Database['public']['Tables']['registrations']['Insert'] = {
        profile_id: user.id,
        ...formData,
        status: 'PENDING',
    }

    const { data, error } = await supabase
        .from('registrations')
        .insert(payload as never)
        .select()
        .returns<{ id: string; reg_number: string | null }[]>()
        .single()

    if (error) {
        console.error('Registration error:', error)
        return { error: 'Terjadi kesalahan saat menyimpan pendaftaran. Silakan coba lagi.' }
    }

    // Log aktivitas
    const logPayload: Database['public']['Tables']['activity_logs']['Insert'] = {
        actor_id: user.id,
        action: 'REGISTRATION_SUBMITTED',
        target_type: 'registrations',
        target_id: data.id,
        details: { reg_number: data.reg_number ?? null },
    }

    await supabase.from('activity_logs').insert(logPayload as never)

    revalidatePath('/dashboard')
    redirect('/dashboard?registered=1')
}

export async function getMyRegistration() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('registrations')
        .select(`
      *,
      course_master(name, level),
      sessions(name, day_of_week, start_time, end_time)
    `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    return data
}

// ===== ADMIN ACTIONS =====

export async function approveRegistration(registrationId: string, sessionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Cek role admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()

    if (profile?.role !== 'super_admin') return { error: 'Unauthorized' }

    const { data, error } = await callRegistrationRpc(supabase, 'admin_approve_registration', {
            p_registration_id: registrationId,
            p_session_id: sessionId,
        })

    if (error) return { error: error.message }
    if (!data?.success) return { error: data?.error ?? 'Gagal menyetujui pendaftaran' }

    revalidatePath('/admin/pendaftar')
    revalidatePath('/admin/siswa')
    revalidatePath('/admin/keuangan')
    return { success: true }
}

export async function rejectRegistration(registrationId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const trimmedReason = reason.trim()
    if (!trimmedReason) return { error: 'Alasan penolakan wajib diisi' }
    if (trimmedReason.length < 10) return { error: 'Alasan penolakan minimal 10 karakter' }

    const { data, error } = await callRegistrationRpc(supabase, 'admin_reject_registration', {
            p_registration_id: registrationId,
            p_reason: trimmedReason,
        })

    if (error) return { error: error.message }
    if (!data?.success) return { error: data?.error ?? 'Gagal menolak pendaftaran' }

    revalidatePath('/admin/pendaftar')
    return { success: true }
}
