import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RegistrationFormClient } from '@/components/registration/RegistrationFormClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Formulir Pendaftaran',
    description: 'Isi formulir pendaftaran kursus komputer',
}

export default async function DaftarPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Harus login
    if (!user) {
        redirect('/login?redirectTo=/daftar')
    }

    // Ambil data kursus dan sesi yang aktif
    const [coursesResult, sessionsResult, existingReg] = await Promise.all([
        supabase.from('course_master').select('id, name, level').eq('is_active', true).order('name'),
        supabase.from('sessions').select('id, name, day_of_week, start_time, end_time, current_count, max_capacity, course_id').eq('is_active', true),
        supabase.from('registrations').select('id, status').eq('profile_id', user.id).neq('status', 'REJECTED').maybeSingle(),
    ])

    // Jika sudah ada pendaftaran aktif
    if (existingReg.data) {
        redirect('/dashboard?already_registered=1')
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <div className="max-w-3xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Formulir Pendaftaran Kursus</h1>
                    <p className="text-muted-foreground mt-1">
                        Lengkapi semua data berikut untuk mendaftar. Admin akan mereview pendaftaran Anda dalam 1–2 hari kerja.
                    </p>
                </div>
                <RegistrationFormClient
                    courses={coursesResult.data ?? []}
                    sessions={sessionsResult.data ?? []}
                />
            </div>
        </div>
    )
}
