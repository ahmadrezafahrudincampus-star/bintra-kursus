'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

    // Insert pendaftaran dengan status PENDING
    const { data, error } = await supabase
        .from('registrations')
        .insert({
            profile_id: user.id,
            ...formData,
            status: 'PENDING',
        } as any)
        .select()
        .single()

    if (error) {
        console.error('Registration error:', error)
        return { error: 'Terjadi kesalahan saat menyimpan pendaftaran. Silakan coba lagi.' }
    }

    // Log aktivitas
    await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'REGISTRATION_SUBMITTED',
        target_type: 'registrations',
        target_id: (data as any).id,
        details: { reg_number: (data as any).reg_number },
    } as any)

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

    // Ambil data registrasi
    const { data: reg, error: regError } = await supabase
        .from('registrations')
        .select('*')
        .eq('id', registrationId)
        .returns<any[]>()
        .single()

    if (regError || !reg) return { error: 'Data pendaftaran tidak ditemukan' }

    // 1. Update registrasi -> APPROVED
    const { error: updateErr } = await supabase
        .from('registrations')
        .update({
            status: 'APPROVED',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
        } as never)
        .eq('id', registrationId)

    if (updateErr) return { error: updateErr.message }

    // 2. Update role user -> student
    const { error: roleErr } = await supabase
        .from('profiles')
        .update({ role: 'student' } as never)
        .eq('id', reg.profile_id)

    if (roleErr) return { error: roleErr.message }

    // 3. Buat enrollment
    const { data: enrollment, error: enrollErr } = await supabase
        .from('student_enrollments')
        .insert({
            profile_id: reg.profile_id,
            session_id: sessionId,
            registration_id: registrationId,
            participant_category: reg.participant_category,
            status: 'ACTIVE',
        } as any)
        .select()
        .single()

    if (enrollErr) return { error: enrollErr.message }

    // 4. Cek kapasitas sesi
    const { data: session } = await supabase
        .from('sessions')
        .select('max_capacity, current_count')
        .eq('id', sessionId)
        .returns<{ max_capacity: number; current_count: number }[]>()
        .single()

    if (session && session.current_count >= session.max_capacity) {
        return { error: 'Sesi sudah penuh. Pilih sesi lain.' }
    }

    // 5. Generate invoice pertama (bulan berjalan)
    const now = new Date()
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 1, 10) // Due tanggal 10 bulan depan

    // Tentukan harga berdasar kategori
    const { data: course } = await supabase
        .from('course_master')
        .select('price_smp, price_sma, price_umum')
        .eq('id', reg.course_id)
        .returns<{ price_smp: number; price_sma: number; price_umum: number }[]>()
        .single()

    let amount = course?.price_umum || 25000
    if (reg.participant_category === 'SMP') amount = course?.price_smp || 15000
    if (reg.participant_category === 'SMA') amount = course?.price_sma || 20000

    const { error: invoiceErr } = await supabase.from('invoices').insert({
        profile_id: reg.profile_id,
        enrollment_id: (enrollment as any).id,
        amount,
        period_month: now.getMonth() + 1,
        period_year: now.getFullYear(),
        due_date: dueDate.toISOString().split('T')[0],
        status: 'UNPAID',
    } as any)

    if (invoiceErr) return { error: invoiceErr.message }

    // 6. Log aktivitas
    await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'REGISTRATION_APPROVED',
        target_type: 'registrations',
        target_id: registrationId,
        details: { profile_id: reg.profile_id, session_id: sessionId },
    } as any)

    revalidatePath('/admin/pendaftar')
    return { success: true }
}

export async function rejectRegistration(registrationId: string, reason: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('registrations')
        .update({
            status: 'REJECTED',
            rejection_reason: reason,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
        } as never)
        .eq('id', registrationId)

    if (error) return { error: error.message }

    await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'REGISTRATION_REJECTED',
        target_type: 'registrations',
        target_id: registrationId,
        details: { reason },
    } as any)

    revalidatePath('/admin/pendaftar')
    return { success: true }
}
