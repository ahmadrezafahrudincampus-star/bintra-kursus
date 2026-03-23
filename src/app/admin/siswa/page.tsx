import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Users, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Siswa | Admin' }

interface StudentRow {
    enrollment_id: string
    profile_id: string
    full_name: string
    phone: string | null
    participant_category: string
    enrolled_at: string
    session_name: string
    day_of_week: string
    start_time: string
    end_time: string
    course_name: string
    open_invoices: number
}

export default async function AdminSiswaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: enrollments } = await supabase
        .from('student_enrollments')
        .select(`
            id, participant_category, enrolled_at,
            profiles(id, full_name, phone),
            sessions(name, day_of_week, start_time, end_time, course_master(name))
        `)
        .eq('status', 'ACTIVE')
        .order('enrolled_at', { ascending: false })
        .returns<any[]>()

    const students = (enrollments ?? []).map((e: any) => ({
        enrollment_id: e.id,
        profile_id: e.profiles?.id,
        full_name: e.profiles?.full_name ?? '—',
        phone: e.profiles?.phone ?? null,
        participant_category: e.participant_category,
        enrolled_at: e.enrolled_at,
        session_name: e.sessions?.name ?? '—',
        day_of_week: e.sessions?.day_of_week ?? '—',
        start_time: e.sessions?.start_time ?? '',
        end_time: e.sessions?.end_time ?? '',
        course_name: e.sessions?.course_master?.name ?? '—',
    })) as StudentRow[]

    // Ambil invoice belum lunas per profile_id
    const profileIds = students.map((s) => s.profile_id).filter(Boolean)
    const { data: unpaidInvoices } = await supabase
        .from('invoices')
        .select('profile_id')
        .in('status', ['UNPAID', 'OVERDUE'])
        .in('profile_id', profileIds.length > 0 ? profileIds : ['__none__'])
        .returns<{ profile_id: string }[]>()

    const unpaidCountMap: Record<string, number> = {}
    for (const inv of unpaidInvoices ?? []) {
        unpaidCountMap[inv.profile_id] = (unpaidCountMap[inv.profile_id] ?? 0) + 1
    }

    const studentsWithInvoice: StudentRow[] = students.map((s) => ({
        ...s,
        open_invoices: unpaidCountMap[s.profile_id] ?? 0,
    }))

    const CATEGORY_BADGE: Record<string, string> = {
        SMP: 'bg-blue-100 text-blue-700',
        SMA: 'bg-purple-100 text-purple-700',
        Umum: 'bg-gray-100 text-gray-700',
    }

    return (
        <div className="space-y-6 max-w-6xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kelola Siswa</h1>
                    <p className="text-muted-foreground mt-1">Daftar semua siswa aktif yang sudah terdaftar</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-700">{studentsWithInvoice.length} Siswa Aktif</span>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Daftar Siswa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {studentsWithInvoice.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Belum ada siswa aktif.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {/* Header */}
                            <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                                <div className="col-span-3">Nama Siswa</div>
                                <div className="col-span-2">Kategori</div>
                                <div className="col-span-3">Program Kursus</div>
                                <div className="col-span-3">Sesi Kelas</div>
                                <div className="col-span-1">Tagihan</div>
                            </div>
                            {studentsWithInvoice.map((s) => (
                                <div key={s.enrollment_id} className="grid grid-cols-1 md:grid-cols-12 gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 border border-border/40 transition-colors">
                                    {/* Nama */}
                                    <div className="col-span-3">
                                        <p className="font-medium text-sm">{s.full_name}</p>
                                        {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                                        <p className="text-xs text-muted-foreground md:hidden mt-1">
                                            Terdaftar: {new Date(s.enrolled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    {/* Kategori */}
                                    <div className="col-span-2 flex items-center">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_BADGE[s.participant_category] ?? 'bg-gray-100 text-gray-700'}`}>
                                            {s.participant_category}
                                        </span>
                                    </div>
                                    {/* Course */}
                                    <div className="col-span-3 flex items-center">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                            <span className="truncate">{s.course_name}</span>
                                        </div>
                                    </div>
                                    {/* Sesi */}
                                    <div className="col-span-3 flex items-center">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                            <span>{s.session_name} · {s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                    {/* Tagihan */}
                                    <div className="col-span-1 flex items-center">
                                        {s.open_invoices > 0 ? (
                                            <div className="flex items-center gap-1 text-orange-600">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span className="text-xs font-semibold">{s.open_invoices}</span>
                                            </div>
                                        ) : (
                                            <CreditCard className="w-3.5 h-3.5 text-green-600" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
