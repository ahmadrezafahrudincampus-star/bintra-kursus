import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { BookOpen, ExternalLink, FileText, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CourseMaterial } from '@/types/database'

export const metadata: Metadata = { title: 'Akses Materi' }

const TYPE_LABELS: Record<CourseMaterial['material_type'], string> = {
    PDF: 'PDF',
    VIDEO: 'Video',
    LINK: 'Link',
    OTHER: 'File',
}

const TYPE_ICONS: Record<CourseMaterial['material_type'], React.ComponentType<{ className?: string }>> = {
    PDF: FileText,
    VIDEO: PlayCircle,
    LINK: ExternalLink,
    OTHER: BookOpen,
}

export default async function DashboardMateriPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select(`
            sessions(
                name,
                course_id,
                course_master(name)
            )
        `)
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{
            sessions: {
                name: string
                course_id: string
                course_master: { name: string } | null
            } | null
        }[]>()
        .maybeSingle()

    const courseId = enrollment?.sessions?.course_id ?? null
    const { data: materials } = courseId
        ? await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .eq('is_published', true)
            .order('order_index', { ascending: true })
            .returns<CourseMaterial[]>()
        : { data: [] as CourseMaterial[] }

    const materialList = materials ?? []

    return (
        <div className="max-w-4xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Akses Materi</h1>
                <p className="mt-1 text-muted-foreground">
                    Materi belajar untuk sesi aktif Anda tersusun rapi di sini.
                </p>
            </div>

            <Card>
                <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Sesi aktif</p>
                    <p className="mt-1 text-lg font-semibold">{enrollment?.sessions?.name ?? 'Belum terdaftar di sesi aktif'}</p>
                    <p className="text-sm text-muted-foreground">
                        {enrollment?.sessions?.course_master?.name ?? 'Program belum tersedia'}
                    </p>
                </CardContent>
            </Card>

            {materialList.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Belum ada materi yang dipublikasikan.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {materialList.map((material) => {
                        const Icon = TYPE_ICONS[material.material_type]
                        const primaryUrl = material.external_url || material.file_url

                        return (
                            <Card key={material.id}>
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <CardTitle className="flex items-center gap-3 text-base">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <p>{material.order_index}. {material.title}</p>
                                            <p className="mt-1 text-sm font-normal text-muted-foreground">
                                                {TYPE_LABELS[material.material_type]}
                                            </p>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5">
                                    {material.description ? (
                                        <p className="text-sm text-muted-foreground">{material.description}</p>
                                    ) : null}

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline">{TYPE_LABELS[material.material_type]}</Badge>
                                        {material.external_url ? <Badge variant="secondary">URL Eksternal</Badge> : null}
                                        {material.file_url ? <Badge variant="secondary">File</Badge> : null}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {primaryUrl ? (
                                            <Button asChild size="sm">
                                                <Link href={primaryUrl} target="_blank" rel="noopener noreferrer">
                                                    Buka Materi
                                                </Link>
                                            </Button>
                                        ) : null}
                                        {material.file_url && material.external_url ? (
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={material.file_url} target="_blank" rel="noopener noreferrer">
                                                    Buka File
                                                </Link>
                                            </Button>
                                        ) : null}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
