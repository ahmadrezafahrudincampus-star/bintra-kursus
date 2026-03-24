import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock3, DoorOpen, GraduationCap, Layers3, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sesi Kelas' }

type SessionRow = {
    id: string
    name: string
    instructor_name: string | null
    room: string | null
    day_of_week: string
    start_time: string
    end_time: string
    max_capacity: number
    current_count: number
    is_active: boolean
    course_master: { name: string; level: string } | null
}

const DAY_ORDER: Record<string, number> = {
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
    Minggu: 7,
}

export default async function AdminSesiPage() {
    const supabase = await createClient()

    const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            id,
            name,
            instructor_name,
            room,
            day_of_week,
            start_time,
            end_time,
            max_capacity,
            current_count,
            is_active,
            course_master(name, level)
        `)
        .returns<SessionRow[]>()

    const sessionList = (sessions ?? []).sort((a, b) => {
        const dayA = DAY_ORDER[a.day_of_week] ?? 99
        const dayB = DAY_ORDER[b.day_of_week] ?? 99
        if (dayA !== dayB) return dayA - dayB
        return a.start_time.localeCompare(b.start_time)
    })

    const activeSessions = sessionList.filter((session) => session.is_active)
    const totalStudents = activeSessions.reduce((sum, session) => sum + session.current_count, 0)
    const totalCapacity = activeSessions.reduce((sum, session) => sum + session.max_capacity, 0)
    const uniqueCourses = new Set(sessionList.map((session) => session.course_master?.name).filter(Boolean)).size

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold">Sesi Kelas</h1>
                <p className="text-muted-foreground mt-1">
                    Pantau seluruh sesi aktif dan nonaktif per program kursus dalam satu tampilan.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: 'Total Sesi', value: sessionList.length, icon: Calendar },
                    { label: 'Sesi Aktif', value: activeSessions.length, icon: Layers3 },
                    { label: 'Siswa Terdaftar', value: totalStudents, icon: GraduationCap },
                    { label: 'Total Kapasitas', value: totalCapacity || 0, icon: UserRound },
                ].map((item) => {
                    const Icon = item.icon
                    return (
                        <Card key={item.label}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                                        <p className="text-2xl font-bold mt-1">{item.value}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center justify-between gap-3">
                        <span>Daftar Sesi</span>
                        <Badge variant="outline">{uniqueCourses} program</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    {sessionList.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                            Belum ada sesi kelas yang dibuat.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sessionList.map((session) => {
                                const occupancy = session.max_capacity > 0
                                    ? Math.round((session.current_count / session.max_capacity) * 100)
                                    : 0

                                return (
                                    <div key={session.id} className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-base font-semibold">{session.name}</h2>
                                                    <Badge variant={session.is_active ? 'default' : 'secondary'}>
                                                        {session.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                    {session.course_master?.level && (
                                                        <Badge variant="outline">{session.course_master.level}</Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {session.course_master?.name ?? 'Program belum terhubung'}
                                                </p>
                                            </div>

                                            <div className="min-w-[180px] rounded-xl bg-muted/40 border border-border/50 px-3 py-2">
                                                <p className="text-xs text-muted-foreground">Keterisian</p>
                                                <p className="text-sm font-semibold mt-0.5">
                                                    {session.current_count}/{session.max_capacity} siswa
                                                </p>
                                                <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                                                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, occupancy)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                                            <div className="rounded-xl border border-border/50 p-3 bg-muted/20">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> Hari
                                                </p>
                                                <p className="font-medium mt-1">{session.day_of_week}</p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 p-3 bg-muted/20">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <Clock3 className="w-3.5 h-3.5" /> Jam
                                                </p>
                                                <p className="font-medium mt-1">{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 p-3 bg-muted/20">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <DoorOpen className="w-3.5 h-3.5" /> Ruang
                                                </p>
                                                <p className="font-medium mt-1">{session.room || 'Belum diatur'}</p>
                                            </div>
                                            <div className="rounded-xl border border-border/50 p-3 bg-muted/20">
                                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                                    <UserRound className="w-3.5 h-3.5" /> Instruktur
                                                </p>
                                                <p className="font-medium mt-1">{session.instructor_name || 'Belum ditentukan'}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/admin/sesi/${session.id}`}>Buka Hub Sesi</Link>
                                            </Button>
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/admin/absensi?session=${session.id}`}>Input Absensi</Link>
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
