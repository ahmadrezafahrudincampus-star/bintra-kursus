import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    CreditCard,
    GraduationCap,
    Layers3,
    Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'Detail Sesi Kelas' }

type SessionDetail = {
    id: string
    name: string
    day_of_week: string
    start_time: string
    end_time: string
    instructor_name: string | null
    room: string | null
    max_capacity: number
    current_count: number
    is_active: boolean
    course_id: string
    course_master: { name: string; level: string } | null
}

type StudentRow = {
    id: string
    participant_category: 'SMP' | 'SMA' | 'Umum'
    enrolled_at: string
    profiles: { full_name: string; phone: string | null } | null
    registrations: { reg_number: string; school_name: string } | null
}

type AttendanceSummaryRow = {
    date: string
    meeting_number: number
    status: 'PRESENT' | 'ABSENT' | 'SICK' | 'PERMIT'
}

type InvoiceRow = {
    id: string
    invoice_number: string
    amount: number
    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
    period_month: number
    period_year: number
    profiles: { full_name: string } | null
}

type MaterialRow = {
    id: string
    title: string
    material_type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
    is_published: boolean
    order_index: number
}

const TAB_LABELS = {
    siswa: 'Daftar Siswa',
    absensi: 'Absensi',
    keuangan: 'Keuangan',
    materi: 'Materi',
} as const

type TabKey = keyof typeof TAB_LABELS

function getStatusBadgeVariant(status: InvoiceRow['status']) {
    if (status === 'PAID') return 'default'
    if (status === 'PENDING_VERIFICATION') return 'secondary'
    if (status === 'OVERDUE') return 'destructive'
    return 'outline'
}

export default async function AdminSesiDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params
    const { tab } = await searchParams
    const activeTab = (tab && tab in TAB_LABELS ? tab : 'siswa') as TabKey

    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: session } = await supabase
        .from('sessions')
        .select(`
            id, name, day_of_week, start_time, end_time, instructor_name, room,
            max_capacity, current_count, is_active, course_id,
            course_master(name, level)
        `)
        .eq('id', id)
        .returns<SessionDetail[]>()
        .single()

    if (!session) notFound()

    const { data: students } = await supabase
        .from('student_enrollments')
        .select(`
            id, participant_category, enrolled_at,
            profiles(full_name, phone),
            registrations(reg_number, school_name)
        `)
        .eq('session_id', id)
        .eq('status', 'ACTIVE')
        .order('enrolled_at')
        .returns<StudentRow[]>()

    const enrollmentIds = (students ?? []).map((student) => student.id)

    const [{ data: attendanceRows }, { data: invoices }, { data: materials }] =
        await Promise.all([
            supabase
                .from('attendances')
                .select('date, meeting_number, status')
                .eq('session_id', id)
                .order('date', { ascending: false })
                .order('meeting_number', { ascending: false })
                .limit(40)
                .returns<AttendanceSummaryRow[]>(),
            enrollmentIds.length > 0
                ? supabase
                    .from('invoices')
                    .select('id, invoice_number, amount, status, period_month, period_year, profiles(full_name)')
                    .in('enrollment_id', enrollmentIds)
                    .order('period_year', { ascending: false })
                    .order('period_month', { ascending: false })
                    .returns<InvoiceRow[]>()
                : Promise.resolve({ data: [] as InvoiceRow[], error: null }),
            supabase
                .from('course_materials')
                .select('id, title, material_type, is_published, order_index')
                .eq('course_id', session.course_id)
                .order('order_index')
                .returns<MaterialRow[]>(),
        ])

    const uniqueAttendanceMeetings = Array.from(
        new Map(
            (attendanceRows ?? []).map((row) => [
                `${row.date}-${row.meeting_number}`,
                row,
            ])
        ).values()
    )

    const unpaidCount = (invoices ?? []).filter((invoice) =>
        ['UNPAID', 'OVERDUE'].includes(invoice.status)
    ).length
    const paidCount = (invoices ?? []).filter((invoice) => invoice.status === 'PAID').length
    const publishedMaterials = (materials ?? []).filter((material) => material.is_published).length
    const occupancyPercent =
        session.max_capacity > 0
            ? Math.min(100, Math.round((session.current_count / session.max_capacity) * 100))
            : 0

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-2 flex flex-wrap gap-2">
                        <Badge variant={session.is_active ? 'default' : 'secondary'}>
                            {session.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        {session.course_master?.level ? (
                            <Badge variant="outline">{session.course_master.level}</Badge>
                        ) : null}
                    </div>
                    <h1 className="text-2xl font-bold">{session.name}</h1>
                    <p className="mt-1 text-muted-foreground">
                        {session.course_master?.name ?? 'Program tidak ditemukan'} · {session.day_of_week},{' '}
                        {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/absensi?session=${session.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                        <Calendar className="h-4 w-4" />
                        Input Absensi
                    </Link>
                    <Link href={`/admin/jadwal`} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
                        <Layers3 className="h-4 w-4" />
                        Kembali ke Jadwal
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Siswa Aktif</p><p className="mt-1 text-2xl font-bold">{students?.length ?? 0}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Meeting Tercatat</p><p className="mt-1 text-2xl font-bold">{uniqueAttendanceMeetings.length}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Invoice Belum Bayar</p><p className="mt-1 text-2xl font-bold">{unpaidCount}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Materi Published</p><p className="mt-1 text-2xl font-bold">{publishedMaterials}</p></CardContent></Card>
            </div>

            <Card>
                <CardContent className="space-y-4 p-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div><p className="text-xs text-muted-foreground">Instruktur</p><p className="font-medium">{session.instructor_name || 'Belum ditentukan'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Ruangan</p><p className="font-medium">{session.room || 'Lab Komputer'}</p></div>
                        <div><p className="text-xs text-muted-foreground">Kapasitas</p><p className="font-medium">{session.current_count}/{session.max_capacity} siswa</p></div>
                        <div><p className="text-xs text-muted-foreground">Invoice Lunas</p><p className="font-medium">{paidCount} invoice</p></div>
                    </div>
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Keterisian kelas</span>
                            <span className="font-medium">{occupancyPercent}%</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${occupancyPercent}%` }} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                {(Object.entries(TAB_LABELS) as [TabKey, string][]).map(([key, label]) => (
                    <Link
                        key={key}
                        href={`/admin/sesi/${session.id}?tab=${key}`}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === key
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-border bg-background text-muted-foreground hover:bg-muted'
                        }`}
                    >
                        {label}
                    </Link>
                ))}
            </div>

            {activeTab === 'siswa' ? (
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Daftar Siswa Sesi Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {students && students.length > 0 ? (
                            <div className="space-y-3">
                                {students.map((student) => (
                                    <div key={student.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="font-medium">{student.profiles?.full_name ?? '-'}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {student.registrations?.reg_number ?? 'Nomor registrasi belum tersedia'} · {student.registrations?.school_name ?? 'Sekolah belum diisi'}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="outline">{student.participant_category}</Badge>
                                                <Badge variant="secondary">
                                                    Terdaftar {new Date(student.enrolled_at).toLocaleDateString('id-ID')}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-sm text-muted-foreground">Belum ada siswa aktif di sesi ini.</div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {activeTab === 'absensi' ? (
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Rekap Absensi per Pertemuan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {uniqueAttendanceMeetings.length > 0 ? (
                            <div className="space-y-3">
                                {uniqueAttendanceMeetings.map((meeting) => (
                                    <div key={`${meeting.date}-${meeting.meeting_number}`} className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-4">
                                        <div>
                                            <p className="font-medium">Pertemuan {meeting.meeting_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(`${meeting.date}T00:00:00`).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <Link href={`/admin/absensi?session=${session.id}&date=${meeting.date}&meeting=${meeting.meeting_number}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Buka Input
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-sm text-muted-foreground">Belum ada absensi tercatat untuk sesi ini.</div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {activeTab === 'keuangan' ? (
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Ringkasan Invoice Siswa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {invoices && invoices.length > 0 ? (
                            <div className="space-y-3">
                                {invoices.map((invoice) => (
                                    <div key={invoice.id} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium">{invoice.invoice_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {invoice.profiles?.full_name ?? 'Siswa tidak ditemukan'} · {invoice.period_month}/{invoice.period_year}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <p className="font-semibold">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                                            <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-sm text-muted-foreground">Belum ada invoice untuk siswa di sesi ini.</div>
                        )}
                    </CardContent>
                </Card>
            ) : null}

            {activeTab === 'materi' ? (
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Materi Program
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {materials && materials.length > 0 ? (
                            <div className="space-y-3">
                                {materials.map((material) => (
                                    <div key={material.id} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium">{material.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {material.material_type} · Urutan {material.order_index}
                                            </p>
                                        </div>
                                        <Badge variant={material.is_published ? 'default' : 'secondary'}>
                                            {material.is_published ? 'Published' : 'Draft'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center text-sm text-muted-foreground">Belum ada materi untuk program sesi ini.</div>
                        )}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    )
}
