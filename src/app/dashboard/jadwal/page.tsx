import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Calendar, Clock3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Jadwal Kelas' }

export default async function DashboardJadwalPage() {
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
                day_of_week,
                start_time,
                end_time,
                instructor_name,
                room,
                course_master(name)
            )
        `)
        .eq('profile_id', user.id)
        .eq('status', 'ACTIVE')
        .returns<{
            sessions: {
                name: string
                day_of_week: string
                start_time: string
                end_time: string
                instructor_name: string | null
                room: string | null
                course_master: { name: string } | null
            } | null
        }[]>()
        .maybeSingle()

    const session = enrollment?.sessions ?? null

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Jadwal Kelas</h1>
                <p className="mt-1 text-muted-foreground">
                    Jadwal sesi aktif Anda ditampilkan di sini.
                </p>
            </div>

            {!session ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Calendar className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Anda belum terdaftar pada sesi aktif.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="space-y-4 p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Program</p>
                            <p className="text-xl font-semibold">{session.course_master?.name ?? '-'}</p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">Nama Sesi</p>
                                <p className="mt-1 font-medium">{session.name}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">Hari</p>
                                <p className="mt-1 font-medium">{session.day_of_week}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">Jam</p>
                                <p className="mt-1 flex items-center gap-2 font-medium">
                                    <Clock3 className="h-4 w-4 text-primary" />
                                    {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                </p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground">Ruangan</p>
                                <p className="mt-1 font-medium">{session.room ?? 'Lab Komputer'}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-xs text-muted-foreground">Instruktur</p>
                            <p className="mt-1 font-medium">{session.instructor_name ?? 'Belum ditentukan'}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
