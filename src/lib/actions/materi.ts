'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CourseMaterial, Database } from '@/types/database'

const MATERIALS_BUCKET = 'course-materials'

function extractMaterialStoragePath(fileUrl: string | null) {
    if (!fileUrl) return null

    try {
        const url = new URL(fileUrl)
        const marker = `/storage/v1/object/public/${MATERIALS_BUCKET}/`
        const markerIndex = url.pathname.indexOf(marker)
        if (markerIndex === -1) return null

        return decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
    } catch {
        return null
    }
}

/** Siswa: ambil materi published untuk course yang sedang diikuti (via enrollment aktif) */
export async function getMyMateri(): Promise<CourseMaterial[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Cari enrollment aktif → session_id → course_id
    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('session_id, sessions(course_id)')
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{ session_id: string; sessions: { course_id: string } | null }[]>()
        .maybeSingle()

    if (!enrollment?.sessions?.course_id) return []

    const { data } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', enrollment.sessions.course_id)
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .returns<CourseMaterial[]>()

    return data ?? []
}

/** Admin: ambil semua materi per course (published & unpublished) */
export async function getMateriByCourseFull(courseId: string): Promise<CourseMaterial[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
        .returns<CourseMaterial[]>()

    return data ?? []
}

/** Admin: tambah materi baru */
export async function createMateri(formData: {
    course_id: string
    title: string
    description?: string
    file_url?: string
    external_url?: string
    material_type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
    order_index?: number
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

    const payload: Database['public']['Tables']['course_materials']['Insert'] = {
        course_id: formData.course_id,
        title: formData.title,
        description: formData.description ?? null,
        file_url: formData.file_url ?? null,
        external_url: formData.external_url ?? null,
        material_type: formData.material_type,
        order_index: formData.order_index ?? 0,
        is_published: false,
    }

    const { data, error } = await supabase
        .from('course_materials')
        .insert(payload as never)
        .select('*')
        .returns<CourseMaterial[]>()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/admin/materi')
    revalidatePath('/dashboard/materi')
    return { success: true, material: data }
}

/** Admin: toggle publish/unpublish materi */
export async function toggleMateriPublish(id: string, isPublished: boolean) {
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

    const payload: Database['public']['Tables']['course_materials']['Update'] = { is_published: isPublished }

    const { error } = await supabase
        .from('course_materials')
        .update(payload as never)
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/materi')
    revalidatePath('/dashboard/materi')
    return { success: true }
}

/** Admin: hapus materi */
export async function deleteMateri(id: string) {
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

    const { data: material, error: materiError } = await supabase
        .from('course_materials')
        .select('file_url')
        .eq('id', id)
        .returns<Pick<CourseMaterial, 'file_url'>[]>()
        .single()

    if (materiError) return { error: materiError.message }

    const storagePath = extractMaterialStoragePath(material?.file_url ?? null)
    if (storagePath) {
        const { error: storageError } = await supabase.storage
            .from(MATERIALS_BUCKET)
            .remove([storagePath])

        if (storageError) return { error: storageError.message }
    }

    const { error } = await supabase.from('course_materials').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/materi')
    revalidatePath('/dashboard/materi')
    return { success: true }
}
