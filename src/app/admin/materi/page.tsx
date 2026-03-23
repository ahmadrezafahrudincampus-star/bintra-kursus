import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getMateriByCourseFull } from '@/lib/actions/materi'
import { MateriAdminClient } from '@/components/admin/MateriAdminClient'
import { BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Konten Materi | Admin' }

export default async function AdminMateriPage({
    searchParams,
}: {
    searchParams: Promise<{ course?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedCourse = params.course ?? ''

    const { data: courses } = await supabase
        .from('course_master')
        .select('id, name, level')
        .eq('is_active', true)
        .order('name')
        .returns<{ id: string; name: string; level: string }[]>()

    const courseList = courses ?? []
    const currentCourse = courseList.find((c) => c.id === selectedCourse)
    const materi = selectedCourse ? await getMateriByCourseFull(selectedCourse) : []

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold">Konten Materi</h1>
                <p className="text-muted-foreground mt-1">Kelola materi pembelajaran per program kursus</p>
            </div>

            {/* Pilih course */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Pilih Program Kursus
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form method="GET">
                        <div className="flex gap-3">
                            <select
                                name="course"
                                defaultValue={selectedCourse}
                                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">-- Pilih Program Kursus --</option>
                                {courseList.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Pilih
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Materi */}
            {selectedCourse && currentCourse ? (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{currentCourse.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MateriAdminClient
                            courseId={selectedCourse}
                            courseName={currentCourse.name}
                            initialMateri={materi}
                        />
                    </CardContent>
                </Card>
            ) : selectedCourse ? (
                <div className="text-center py-10 text-muted-foreground text-sm">Program tidak ditemukan.</div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Pilih program kursus untuk melihat dan mengelola materi.</p>
                </div>
            )}
        </div>
    )
}
