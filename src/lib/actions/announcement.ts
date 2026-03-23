'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Announcement {
    id: string
    title: string
    content: string
    target_session_id: string | null
    is_active: boolean
    created_at: string
    created_by: string
}

/** Siswa/Admin: ambil semua pengumuman aktif */
export async function getAnnouncements(): Promise<Announcement[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .returns<Announcement[]>()

    return data ?? []
}

/** Admin: semua pengumuman (termasuk nonaktif) */
export async function getAllAnnouncements(): Promise<Announcement[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .returns<Announcement[]>()

    return data ?? []
}

/** Admin: buat pengumuman baru */
export async function createAnnouncement(formData: {
    title: string
    content: string
    target_session_id?: string | null
}) {
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

    const { error } = await supabase
        .from('announcements')
        .insert({
            title: formData.title,
            content: formData.content,
            target_session_id: formData.target_session_id ?? null,
            created_by: user.id,
            is_active: true,
        } as never)

    if (error) return { error: error.message }

    revalidatePath('/admin/pengumuman')
    revalidatePath('/dashboard')
    return { success: true }
}

/** Admin: toggle aktif/nonaktif pengumuman */
export async function toggleAnnouncement(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('announcements')
        .update({ is_active: isActive } as never)
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/pengumuman')
    revalidatePath('/dashboard')
    return { success: true }
}

/** Admin: hapus pengumuman */
export async function deleteAnnouncement(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/pengumuman')
    return { success: true }
}
