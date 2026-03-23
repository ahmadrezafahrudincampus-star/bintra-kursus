import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    ClipboardList, CheckCircle, XCircle, Clock, ArrowRight,
    Calendar, BookOpen, CreditCard, UserCheck, AlertCircle,
} from 'lucide-react'
import type { Metadata } from 'next'

import type { Profile } from '@/types/database'

export const metadata: Metadata = { title: 'Dashboard' }

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: 'Menunggu Review', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: Clock, badgeVariant: 'outline' },
    APPROVED: { label: 'Disetujui', color: 'bg-green-50 border-green-200 text-green-800', icon: CheckCircle, badgeVariant: 'default' },
    REJECTED: { label: 'Ditolak', color: 'bg-red-50 border-red-200 text-red-800', icon: XCircle, badgeVariant: 'destructive' },
    DRAFT: { label: 'Draft', color: 'bg-gray-50 border-gray-200 text-gray-800', icon: ClipboardList, badgeVariant: 'secondary' },
}

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).returns<Profile[]>().single()
    if (!profile) redirect('/login')

    const isStudent = profile.role === 'student'

    // Ambil data sesuai role
    const [regResult, enrollResult] = await Promise.all([
        supabase.from('registrations').select(`
      id, status, reg_number, rejection_reason, created_at, updated_at,
      course_master(name), sessions(name, day_of_week, start_time, end_time)
    `).eq('profile_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        isStudent
            ? supabase.from('student_enrollments').select(`
          id, status, enrolled_at,
          sessions(name, day_of_week, start_time, end_time, course_id,
            course_master(name))
        `).eq('profile_id', user.id).eq('status', 'ACTIVE').limit(1).maybeSingle()
            : Promise.resolve({ data: null }),
    ])

    interface RegData {
        id: string
        status: string
        reg_number: string | null
        rejection_reason: string | null
        created_at: string
        updated_at: string
        course_master: { name: string } | null
        sessions: { name: string, day_of_week: string, start_time: string, end_time: string } | null
    }

    interface EnrollData {
        id: string
        status: string
        enrolled_at: string
        sessions: { name: string, day_of_week: string, start_time: string, end_time: string, course_id: string, course_master: { name: string } | null } | null
    }

    interface InvoiceData {
        id: string
        amount: number
        status: string
        period_month: number
        period_year: number
        due_date: string
    }

    // Data untuk siswa aktif
    let invoiceData: InvoiceData[] | null = null, attendanceStats = null
    if (isStudent && enrollResult.data) {
        const [invRes, attRes] = await Promise.all([
            supabase.from('invoices').select('id, amount, status, period_month, period_year, due_date')
                .eq('profile_id', user.id).in('status', ['UNPAID', 'OVERDUE']).order('due_date').limit(3),
            supabase.from('attendances').select('status').eq('enrollment_id', (enrollResult.data as EnrollData).id),
        ])
        invoiceData = (invRes.data ?? []) as InvoiceData[]
        if (attRes.data && attRes.data.length > 0) {
            const attData = attRes.data as { status: string }[]
            const total = attData.length
            const hadir = attData.filter((a) => a.status === 'PRESENT').length
            attendanceStats = { total, hadir, percent: Math.round((hadir / total) * 100) }
        }
    }

    const reg = (regResult.data ? regResult.data : null) as RegData | null
    const enrollment = (enrollResult.data ? enrollResult.data : null) as EnrollData | null

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="h2 mb-1">
                    Halo, {profile.full_name.split(' ')[0]}! 👋
                </h1>
                <p className="body-sm text-muted-foreground mt-1">
                    {isStudent ? 'Selamat belajar hari ini!' : 'Pantau status pendaftaran Anda di sini.'}
                </p>
            </div>

            {/* ===== APPLICANT VIEW ===== */}
            {!isStudent && (
                <div className="space-y-4">
                    {!reg && (
                        <Card className="border-[--primary]/20 bg-[--primary]/5">
                            <CardContent className="p-6 text-center space-y-4">
                                <div className="w-16 h-16 rounded-full bg-[--primary]/10 mx-auto flex items-center justify-center">
                                    <ClipboardList className="w-8 h-8 text-[--primary]" />
                                </div>
                                <div>
                                    <h2 className="h4">Belum Ada Pendaftaran</h2>
                                    <p className="body-sm text-muted-foreground mt-2">
                                        Anda belum mengisi formulir pendaftaran kursus. Daftar sekarang untuk bergabung!
                                    </p>
                                </div>
                                <Button asChild>
                                    <Link href="/daftar">
                                        Isi Formulir Pendaftaran
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {reg && (() => {
                        const cfg = STATUS_CONFIG[reg.status] ?? STATUS_CONFIG.PENDING
                        const Icon = cfg.icon
                        return (
                            <Card className={`border ${cfg.color}`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-6 h-6 text-primary" />
                                            <div>
                                                <CardTitle className="h5">Status Pendaftaran</CardTitle>
                                                {reg.reg_number && (
                                                    <p className="caption text-muted-foreground mt-0.5">No. Pendaftaran: {reg.reg_number}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant={cfg.badgeVariant}>{cfg.label}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {(reg.course_master as { name: string } | null)?.name && (
                                        <p className="text-sm">
                                            <span className="opacity-70">Program Pilihan: </span>
                                            <strong>{(reg.course_master as { name: string }).name}</strong>
                                        </p>
                                    )}
                                    <p className="text-sm"><span className="opacity-70">Tanggal Daftar: </span>
                                        {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>

                                    {reg.status === 'PENDING' && (
                                        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 text-sm">
                                            <p className="label-md text-warning-foreground">⏳ Sedang Diproses</p>
                                            <p className="body-sm mt-1 text-muted-foreground">Admin akan mereview pendaftaran Anda dalam 1–2 hari kerja. Kami akan menghubungi Anda melalui nomor HP yang terdaftar.</p>
                                        </div>
                                    )}

                                    {reg.status === 'APPROVED' && (
                                        <div className="bg-success/10 border border-success/30 rounded-xl p-3 text-sm">
                                            <p className="label-md text-success-foreground">🎉 Pendaftaran Disetujui!</p>
                                            <p className="body-sm mt-1 text-muted-foreground">Akun Anda sudah diaktifkan sebagai siswa. Silakan refresh halaman untuk melihat dashboard siswa lengkap.</p>
                                        </div>
                                    )}

                                    {reg.status === 'REJECTED' && (
                                        <div className="bg-red-100/50 border border-red-200 rounded-lg p-3 text-sm">
                                            <p className="font-medium">❌ Pendaftaran Ditolak</p>
                                            {reg.rejection_reason && (
                                                <p className="opacity-80 text-xs mt-1">Alasan: {reg.rejection_reason}</p>
                                            )}
                                            <p className="opacity-80 text-xs mt-1">Silakan hubungi admin untuk informasi lebih lanjut.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })()}
                </div>
            )}

            {/* ===== STUDENT VIEW ===== */}
            {isStudent && enrollment && (
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="label-sm text-muted-foreground uppercase tracking-wider mb-0.5">Kursus</p>
                                        <p className="h5 leading-tight">
                                            {(enrollment.sessions as { course_master?: { name: string } } | null)?.course_master?.name?.split(':')[0] ?? 'Aktif'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                                        <Calendar className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="label-sm text-muted-foreground uppercase tracking-wider mb-0.5">Jadwal</p>
                                        <p className="h5 leading-tight">
                                            {(enrollment.sessions as { day_of_week?: string } | null)?.day_of_week ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                                        <UserCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="label-sm text-muted-foreground uppercase tracking-wider mb-0.5">Kehadiran</p>
                                        <p className="h5 leading-tight">
                                            {attendanceStats ? `${attendanceStats.percent}%` : '—'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="label-sm text-muted-foreground uppercase tracking-wider mb-0.5">Tagihan Aktif</p>
                                        <p className="h5 leading-tight">
                                            {invoiceData?.length ?? 0} tagihan
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tagihan Belum Bayar */}
                    {invoiceData && invoiceData.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50/50">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                        Tagihan Belum Lunas
                                    </CardTitle>
                                    <Link href="/dashboard/iuran" className="text-xs text-[--primary] hover:underline flex items-center gap-1">
                                        Lihat Semua <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {invoiceData.map((inv) => (
                                    <div key={inv.id} className="flex items-center justify-between py-2 border-b border-orange-200/50 last:border-0">
                                        <div>
                                            <p className="body-sm font-medium">
                                                Iuran {new Date(inv.period_year, inv.period_month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <p className="caption text-muted-foreground">
                                                Jatuh tempo: {new Date(inv.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-orange-700">Rp {inv.amount.toLocaleString('id-ID')}</p>
                                            <Badge variant={inv.status === 'OVERDUE' ? 'destructive' : 'outline'} className="text-xs">
                                                {inv.status === 'OVERDUE' ? 'Jatuh Tempo' : 'Belum Bayar'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <Button asChild size="sm" className="w-full mt-2">
                                    <Link href="/dashboard/upload-kartu">Upload Bukti Pembayaran</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { href: '/dashboard/jadwal', icon: Calendar, label: 'Jadwal Saya', color: 'text-blue-600 bg-blue-50' },
                            { href: '/dashboard/materi', icon: BookOpen, label: 'Materi', color: 'text-teal-600 bg-teal-50' },
                            { href: '/dashboard/absensi', icon: UserCheck, label: 'Absensi', color: 'text-green-600 bg-green-50' },
                            { href: '/dashboard/kartu-iuran', icon: CreditCard, label: 'Kartu Iuran', color: 'text-orange-600 bg-orange-50' },
                        ].map((action) => {
                            const Icon = action.icon
                            return (
                                <Link
                                    key={action.href}
                                    href={action.href}
                                    className="border border-border/60 rounded-2xl p-4 transition-hover hover:-translate-y-0.5 hover:shadow-md text-center space-y-2 bg-card group"
                                >
                                    <div className={`w-10 h-10 rounded-xl ${action.color} flex items-center justify-center mx-auto opacity-80 group-hover:opacity-100 transition-opacity`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <p className="label-md">{action.label}</p>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
