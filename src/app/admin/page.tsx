import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Users,
    UserPlus,
    CreditCard,
    CheckCircle,
    Clock,
    ArrowRight,
    TrendingUp,
    BookOpen,
    ClipboardList,
    Activity,
    Wallet,
    Receipt,
} from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Overview' }

interface PendingReg {
    id: string
    full_name: string
    reg_number: string | null
    participant_category: string
    created_at: string
    course_master: { name: string } | null
}

interface FeedItem {
    id: string
    type: 'registration' | 'payment' | 'attendance'
    title: string
    created_at: string
}

function formatRelativeTime(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime()
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))

    if (diffMinutes < 1) return 'Baru saja'
    if (diffMinutes < 60) return `${diffMinutes} menit lalu`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} jam lalu`

    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default async function AdminDashboardPage() {
    const supabase = await createClient()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const startOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString().split('T')[0]
    const startOfToday = new Date(currentYear, now.getMonth(), now.getDate()).toISOString()

    const [
        studentsResult,
        pendingRegsResult,
        totalPendingResult,
        paidThisMonthResult,
        unpaidResult,
        attendanceMonthResult,
        pendingFeedResult,
        paymentFeedResult,
        attendanceFeedResult,
    ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('registrations').select(`
            id, full_name, reg_number, participant_category, created_at,
            course_master(name)
        `).eq('status', 'PENDING').order('created_at', { ascending: true }).limit(5),
        supabase.from('registrations').select('id', { count: 'exact' }).eq('status', 'PENDING'),
        supabase.from('invoices').select('amount').eq('status', 'PAID').eq('period_year', currentYear).eq('period_month', currentMonth).returns<{ amount: number }[]>(),
        supabase.from('invoices').select('amount').in('status', ['UNPAID', 'OVERDUE']).returns<{ amount: number; status: string }[]>(),
        supabase.from('attendances').select('id, session_id, date, meeting_number, status').gte('date', startOfMonth).returns<{ id: string; session_id: string; date: string; meeting_number: number; status: string }[]>(),
        supabase.from('registrations').select('id, full_name, created_at').eq('status', 'PENDING').order('created_at', { ascending: false }).limit(5).returns<{ id: string; full_name: string; created_at: string }[]>(),
        supabase.from('payment_proofs').select(`
            id, created_at,
            profiles:uploaded_by(full_name)
        `).eq('status', 'PENDING').order('created_at', { ascending: false }).limit(5).returns<{ id: string; created_at: string; profiles: { full_name: string } | null }[]>(),
        supabase.from('attendances').select(`
            id, created_at,
            sessions(name)
        `).gte('created_at', startOfToday).order('created_at', { ascending: false }).limit(5).returns<{ id: string; created_at: string; sessions: { name: string } | null }[]>(),
    ])

    const pendingRegs = (pendingRegsResult.data ?? []) as PendingReg[]
    const paidThisMonth = (paidThisMonthResult.data ?? []).reduce((sum, item) => sum + item.amount, 0)
    const totalUnpaidAmount = (unpaidResult.data ?? []).reduce((sum, item) => sum + item.amount, 0)

    const attendanceMonth = attendanceMonthResult.data ?? []
    const totalAttendanceRecords = attendanceMonth.length
    const totalPresent = attendanceMonth.filter((item) => item.status === 'PRESENT').length
    const totalMeetings = new Set(
        attendanceMonth.map((item) => `${item.session_id}-${item.date}-${item.meeting_number}`)
    ).size
    const attendancePercent = totalAttendanceRecords > 0
        ? Math.round((totalPresent / totalAttendanceRecords) * 100)
        : 0

    const activityFeed: FeedItem[] = [
        ...(pendingFeedResult.data ?? []).map((item) => ({
            id: `registration-${item.id}`,
            type: 'registration' as const,
            title: `Pendaftar baru: ${item.full_name}`,
            created_at: item.created_at,
        })),
        ...(paymentFeedResult.data ?? []).map((item) => ({
            id: `payment-${item.id}`,
            type: 'payment' as const,
            title: `Bukti bayar masuk: ${item.profiles?.full_name ?? 'Siswa'}`,
            created_at: item.created_at,
        })),
        ...(attendanceFeedResult.data ?? []).map((item) => ({
            id: `attendance-${item.id}`,
            type: 'attendance' as const,
            title: `Absensi diinput: ${item.sessions?.name ?? 'Sesi kelas'}`,
            created_at: item.created_at,
        })),
    ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="h2">Admin Overview</h1>
                <p className="body-sm text-muted-foreground mt-1">
                    {now.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {([
                    {
                        label: 'Total Siswa Aktif',
                        value: studentsResult.count ?? 0,
                        icon: Users,
                        color: 'bg-blue-50 text-blue-600',
                        href: '/admin/siswa',
                    },
                    {
                        label: 'Menunggu Review',
                        value: totalPendingResult.count ?? 0,
                        icon: Clock,
                        color: 'bg-yellow-50 text-yellow-600',
                        href: '/admin/pendaftar',
                        alert: (totalPendingResult.count ?? 0) > 0,
                    },
                    {
                        label: 'Pemasukan Bulan Ini',
                        value: `Rp ${paidThisMonth.toLocaleString('id-ID')}`,
                        icon: Wallet,
                        color: 'bg-green-50 text-green-600',
                        href: '/admin/keuangan',
                    },
                    {
                        label: 'Total Tunggakan',
                        value: `Rp ${totalUnpaidAmount.toLocaleString('id-ID')}`,
                        icon: TrendingUp,
                        color: 'bg-red-50 text-red-600',
                        href: '/admin/keuangan',
                    },
                ] as { label: string; value: string | number; icon: React.ElementType; color: string; href: string; alert?: boolean }[]).map((stat) => {
                    const Icon = stat.icon

                    return (
                        <Link key={stat.label} href={stat.href}>
                            <Card className={cn(stat.alert && 'border-warning/50 ring-1 ring-warning')}>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="caption text-muted-foreground mb-1 uppercase tracking-wider">{stat.label}</p>
                                            <p className="h3 break-words">{stat.value}</p>
                                        </div>
                                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center shrink-0`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    {stat.alert && (
                                        <p className="text-xs text-yellow-600 mt-2 font-medium">Perlu ditindaklanjuti</p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    )
                })}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-6">
                <Card>
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="h5 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            Ringkasan Absensi Bulan Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Total Pertemuan</p>
                                <p className="text-2xl font-bold mt-1">{totalMeetings}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Total Hadir</p>
                                <p className="text-2xl font-bold mt-1">{totalPresent}</p>
                            </div>
                            <div className="rounded-xl border border-border/60 p-4 bg-muted/20">
                                <p className="text-xs text-muted-foreground">Rata-rata Kehadiran</p>
                                <p className="text-2xl font-bold mt-1">{attendancePercent}%</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <p className="font-medium">Progress Kehadiran</p>
                                <p className="text-muted-foreground">
                                    {totalPresent} dari {totalAttendanceRecords || 0} record
                                </p>
                            </div>
                            <div className="h-3 rounded-full bg-muted overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-[--primary] to-[--accent]"
                                    style={{ width: `${attendancePercent}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Rekap dihitung dari seluruh data absensi bulan berjalan.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="h5 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {activityFeed.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Belum ada aktivitas terbaru hari ini.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activityFeed.map((item) => {
                                    const config = item.type === 'registration'
                                        ? { icon: UserPlus, color: 'bg-blue-50 text-blue-600' }
                                        : item.type === 'payment'
                                            ? { icon: Receipt, color: 'bg-yellow-50 text-yellow-600' }
                                            : { icon: ClipboardList, color: 'bg-green-50 text-green-600' }
                                    const Icon = config.icon

                                    return (
                                        <div key={item.id} className="flex items-start gap-3 border border-border/60 rounded-xl p-3">
                                            <div className={`w-9 h-9 rounded-lg ${config.color} flex items-center justify-center shrink-0`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="body-sm font-medium leading-snug">{item.title}</p>
                                                <p className="caption text-muted-foreground mt-0.5">
                                                    {formatRelativeTime(item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="h5 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            Pendaftar Menunggu Review
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/pendaftar">
                                Lihat Semua <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {pendingRegs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Tidak ada pendaftar yang perlu direview</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {pendingRegs.map((reg) => (
                                <div key={reg.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                                            {reg.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{reg.full_name}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {reg.course_master?.name ?? '-'} · {reg.participant_category}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <p className="text-xs text-muted-foreground hidden sm:block">
                                            {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                        <Button size="sm" asChild>
                                            <Link href="/admin/pendaftar">Review</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { href: '/admin/sesi', icon: BookOpen, label: 'Kelola Sesi' },
                    { href: '/admin/absensi', icon: Users, label: 'Input Absensi' },
                    { href: '/admin/keuangan', icon: CreditCard, label: 'Verifikasi Bukti' },
                    { href: '/admin/export', icon: TrendingUp, label: 'Export Laporan' },
                ].map((item) => {
                    const Icon = item.icon

                    return (
                        <Link key={item.href} href={item.href} className="border border-border/60 rounded-2xl p-4 transition-hover hover:-translate-y-0.5 hover:shadow-md text-center space-y-2 bg-card">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                                <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <p className="label-md">{item.label}</p>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
