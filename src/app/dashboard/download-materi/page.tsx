import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Download, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { CourseMaterial } from '@/types/database'

export const metadata: Metadata = { title: 'Download Materi' }

export default async function DashboardDownloadMateriPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: enrollment } = await supabase
        .from('student_enrollments')
        .select('sessions(course_id)')
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{ sessions: { course_id: string } | null }[]>()
        .maybeSingle()

    const courseId = enrollment?.sessions?.course_id ?? null
    const { data: materials } = courseId
        ? await supabase
            .from('course_materials')
            .select('*')
            .eq('course_id', courseId)
            .eq('is_published', true)
            .not('file_url', 'is', null)
            .order('order_index', { ascending: true })
            .returns<CourseMaterial[]>()
        : { data: [] as CourseMaterial[] }

    const downloadableMaterials = (materials ?? []).filter((material) => material.file_url)

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Download Materi</h1>
                <p className="mt-1 text-muted-foreground">
                    Unduh file materi yang sudah dipublikasikan untuk program Anda.
                </p>
            </div>

            {downloadableMaterials.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <FileText className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Belum ada file materi yang bisa diunduh.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {downloadableMaterials.map((material) => (
                        <Card key={material.id}>
                            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">{material.order_index}. {material.title}</p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {material.description || 'File materi siap diunduh.'}
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link href={material.file_url!} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
