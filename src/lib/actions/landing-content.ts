'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
    DEFAULT_LANDING_CONTENT,
    normalizeLandingContent,
    type LandingContent,
} from '@/lib/landing-content'

type MediaAssetInput = {
    file_name: string
    file_path: string
    public_url: string
    alt_text: string
    mime_type: string
    size_bytes: number
    category: string
}

export type LandingMediaAsset = {
    id: string
    file_name: string
    file_path: string
    public_url: string
    alt_text: string | null
    mime_type: string | null
    size_bytes: number | null
    category: string | null
    uploaded_by: string | null
    created_at: string
}

async function requireSuperAdmin() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { supabase, error: 'Unauthorized' as const }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()

    if (profile?.role !== 'super_admin') {
        return { supabase, error: 'Unauthorized' as const }
    }

    return { supabase, user }
}

function landingContentPayload(payload: LandingContent) {
    return {
        id: 'main',
        ...payload,
    }
}

function extractLandingStoragePath(fileUrl: string) {
    try {
        const marker = '/storage/v1/object/public/landing-media/'
        const index = fileUrl.indexOf(marker)
        if (index === -1) return null
        return fileUrl.slice(index + marker.length)
    } catch {
        return null
    }
}

export async function getLandingContent(): Promise<LandingContent> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('landing_page_content')
        .select('*')
        .eq('id', 'main')
        .maybeSingle()

    return normalizeLandingContent(data ?? DEFAULT_LANDING_CONTENT)
}

export async function getLandingMediaAssets(): Promise<LandingMediaAsset[]> {
    const auth = await requireSuperAdmin()

    if ('error' in auth) {
        return []
    }

    const { data } = await auth.supabase
        .from('media_assets')
        .select('id, file_name, file_path, public_url, alt_text, mime_type, size_bytes, category, uploaded_by, created_at')
        .order('created_at', { ascending: false })

    return (data ?? []) as LandingMediaAsset[]
}

export async function updateLandingContent(input: LandingContent) {
    const auth = await requireSuperAdmin()

    if ('error' in auth) {
        return { error: auth.error }
    }

    const payload = normalizeLandingContent(input)

    const { error } = await auth.supabase
        .from('landing_page_content')
        .upsert({
            ...landingContentPayload(payload),
            updated_by: auth.user.id,
        } as never)

    if (error) {
        return { error: error.message }
    }

    await auth.supabase.from('activity_logs').insert({
        actor_id: auth.user.id,
        action: 'UPDATE_LANDING_CONTENT',
        target_type: 'landing_page_content',
        target_id: 'main',
        details: {
            navigation_count: payload.navigation_items.length,
            program_count: payload.program_items.length,
            testimonial_count: payload.testimonials_items.length,
        },
    } as never)

    revalidatePath('/')
    revalidatePath('/admin/pengaturan')

    return { success: true }
}

export async function registerLandingMediaAsset(input: MediaAssetInput) {
    const auth = await requireSuperAdmin()

    if ('error' in auth) {
        return { error: auth.error }
    }

    const { data, error } = await auth.supabase
        .from('media_assets')
        .insert({
            file_name: input.file_name,
            file_path: input.file_path,
            public_url: input.public_url,
            alt_text: input.alt_text || null,
            mime_type: input.mime_type || null,
            size_bytes: input.size_bytes || null,
            category: input.category || 'landing',
            uploaded_by: auth.user.id,
        } as never)
        .select('id, file_name, file_path, public_url, alt_text, mime_type, size_bytes, category, uploaded_by, created_at')
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/pengaturan')

    return { success: true, asset: data as LandingMediaAsset }
}

export async function deleteLandingMediaAsset(id: string) {
    const auth = await requireSuperAdmin()

    if ('error' in auth) {
        return { error: auth.error }
    }

    const { data: asset, error: assetError } = await auth.supabase
        .from('media_assets')
        .select('id, file_path, public_url')
        .eq('id', id)
        .returns<{ id: string; file_path: string; public_url: string }[]>()
        .single()

    if (assetError || !asset) {
        return { error: assetError?.message ?? 'Media tidak ditemukan' }
    }

    const landingContent = await getLandingContent()
    const serialized = JSON.stringify(landingContent)

    if (serialized.includes(asset.public_url)) {
        return { error: 'Media masih dipakai di landing page. Ganti atau hapus referensinya terlebih dahulu.' }
    }

    const storagePath = extractLandingStoragePath(asset.public_url)
    if (storagePath) {
        const { error: storageError } = await auth.supabase.storage
            .from('landing-media')
            .remove([storagePath])

        if (storageError) {
            return { error: storageError.message }
        }
    }

    const { error } = await auth.supabase
        .from('media_assets')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin/pengaturan')

    return { success: true }
}
