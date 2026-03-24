'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolvePostLoginRedirect } from '@/lib/auth/redirect'
import type { Database } from '@/types/database'

export async function signUp(formData: {
    email: string
    password: string
    full_name: string
    phone: string
}) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                full_name: formData.full_name,
            },
        },
    })

    if (error) {
        return { error: error.message }
    }

    // Update phone di profile (trigger sudah create profile)
    if (data.user) {
        await supabase
            .from('profiles')
            .update({ phone: formData.phone } as never)
            .eq('id', data.user.id)
    }

    redirect('/dashboard')
}

export async function signIn(formData: { email: string; password: string; redirectTo?: string | null }) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    })

    if (error) {
        return { error: 'Email atau password salah. Silakan coba lagi.' }
    }

    // Get role dan redirect sesuai
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .returns<{ role: string }[]>()
        .single()

    redirect(
        resolvePostLoginRedirect({
            role: profile?.role,
            redirectTo: formData.redirectTo,
        })
    )
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function resetPasswordRequest(email: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function getProfile() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .returns<Database['public']['Tables']['profiles']['Row'][]>()
        .single()

    return profile
}
