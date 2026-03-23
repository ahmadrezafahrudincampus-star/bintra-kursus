import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Filter, User, CreditCard } from 'lucide-react'
import { PrintKartuIuranButton } from '@/components/dashboard/PrintKartuIuranButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Cetak Kartu Iuran | Admin' }

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PAID: { label: 'LUNAS', className: 'bg-green-100 text-green-800 border border-green-300' },
    PENDING_VERIFICATION: { label: 'PENDING VERIFIKASI', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    UNPAID: { label: 'BELUM BAYAR', className: 'bg-orange-100 text-orange-800 border border-orange-300' },
    OVERDUE: { label: 'JATUH TEMPO', className: 'bg-red-100 text-red-800 border border-red-300' },
}

const BULAN_ID = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export const dynamic = 'force-dynamic'

interface AdminProfileData {
    full_name: string
    phone: string | null
}

interface AdminEnrollmentData {
    sessions: {
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        course_master: { name: string } | null
    } | null
}

export default async function AdminKartuIuranPage({
    searchParams,
}: {
    searchParams: Promise<{ session?: string; profile?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const selectedSession = params.session ?? ''
    const selectedProfile = params.profile ?? ''

    const { data: sessionsData } = await supabase
        .from('sessions')
        .select('id, name, day_of_week, course_master(name)')
        .eq('is_active', true)
        .order('day_of_week')
        .order('name')

    const sessions = sessionsData ?? []

    let students: { id: string; name: string }[] = []
    if (selectedSession) {
        const { data: enrollments } = await supabase
            .from('student_enrollments')
            .select('profile_id, profiles(full_name)')
            .eq('session_id', selectedSession)
            .eq('status', 'ACTIVE')

        if (enrollments) {
            students = enrollments
                .map((enrollment: any) => ({
                    id: enrollment.profile_id,
                    name: enrollment.profiles?.full_name ?? '-',
                }))
                .sort((a, b) => a.name.localeCompare(b.name))
        }
    }

    let profileData: AdminProfileData | null = null
    let enrollmentData: AdminEnrollmentData | null = null
    let invoices: any[] = []

    if (selectedProfile) {
        const [{ data: profile }, { data: enrollment }, { data: invoiceData }] = await Promise.all([
            supabase.from('profiles').select('full_name, phone').eq('id', selectedProfile).single(),
            supabase
                .from('student_enrollments')
                .select(`
                    id,
                    sessions(
                        name,
                        day_of_week,
                        start_time,
                        end_time,
                        course_master(name)
                    )
                `)
                .eq('profile_id', selectedProfile)
                .eq('session_id', selectedSession)
                .eq('status', 'ACTIVE')
                .single(),
            supabase
                .from('invoices')
                .select('id, amount, status, period_month, period_year, due_date, invoice_number')
                .eq('profile_id', selectedProfile),
        ])

        profileData = (profile ?? null) as AdminProfileData | null
        enrollmentData = (enrollment ?? null) as AdminEnrollmentData | null
        invoices = invoiceData ?? []
    }

    invoices.sort((a, b) => {
        if (a.period_year !== b.period_year) return a.period_year - b.period_year
        return a.period_month - b.period_month
    })

    const yearString = invoices.length > 0 ? String(invoices[0].period_year) : String(new Date().getFullYear())

    return (
        <>
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 12mm;
                }

                @media print {
                    html, body {
                        background: white !important;
                    }

                    aside,
                    #sidebar-toggle,
                    .no-print {
                        display: none !important;
                    }

                    main,
                    main > div {
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                    }

                    .admin-kartu-print {
                        box-shadow: none !important;
                        border: 1px solid rgba(0, 0, 0, 0.5) !important;
                    }
                }
            `}</style>

            <div className="space-y-6 max-w-5xl">
                <div className="no-print">
                    <h1 className="h2 mb-1">Cetak Kartu Iuran</h1>
                    <p className="body-sm text-muted-foreground">Pilih sesi kelas dan siswa untuk mencetak kartu iuran resmi.</p>
                </div>

                <Card className="no-print">
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="h5 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Pemilihan Data Siswa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form method="GET" className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 space-y-1">
                                <label className="label-sm text-muted-foreground uppercase tracking-wider">Sesi Kelas</label>
                                <select
                                    name="session"
                                    defaultValue={selectedSession}
                                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">-- Pilih Sesi --</option>
                                    {sessions.map((session: any) => (
                                        <option key={session.id} value={session.id}>
                                            {session.name} ({session.day_of_week}) {session.course_master?.name ? `- ${session.course_master.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedSession && (
                                <div className="flex-1 space-y-1">
                                    <label className="label-sm text-muted-foreground uppercase tracking-wider">Nama Siswa</label>
                                    <select
                                        name="profile"
                                        defaultValue={selectedProfile}
                                        className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">-- Pilih Siswa --</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id}>{student.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="px-5 py-2 h-[38px] bg-primary text-primary-foreground rounded-lg text-sm font-medium transition hover:bg-primary/90"
                                >
                                    Tampilkan Kartu
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {selectedProfile && profileData && enrollmentData ? (
                    <div>
                        <div className="max-w-2xl mx-auto rounded-xl border-2 border-black/80 shadow-[8px_8px_0_rgba(0,0,0,0.15)] bg-yellow-50/50 p-6 md:p-8 relative overflow-hidden print:shadow-none print:border-r-2 print:border-b-2 admin-kartu-print">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <CreditCard className="w-64 h-64 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between border-b-2 border-black/20 pb-4 mb-5">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-black">
                                            Kartu Iuran
                                        </h2>
                                        <p className="font-bold text-gray-700 italic">
                                            {enrollmentData.sessions?.course_master?.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tahun</p>
                                        <p className="text-3xl font-black">{yearString}</p>
                                    </div>
                                </div>

                                <div className="bg-white/60 p-4 rounded-lg border border-black/10 mb-6 flex flex-col sm:flex-row gap-4 justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Siswa</span>
                                            <span className="font-bold text-lg leading-none mt-1">{profileData.full_name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">No. WhatsApp</span>
                                            <span className="font-medium">{profileData.phone || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 flex-1 sm:border-l border-black/10 sm:pl-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelas / Sesi</span>
                                            <span className="font-bold">{enrollmentData.sessions?.name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Jadwal</span>
                                            <span className="font-medium text-sm">
                                                {enrollmentData.sessions?.day_of_week}, Pukul {enrollmentData.sessions?.start_time?.slice(0, 5)}-{enrollmentData.sessions?.end_time?.slice(0, 5)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white border rounded overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-600">
                                            <tr>
                                                <th className="px-3 py-2 border-b border-gray-200">#</th>
                                                <th className="px-3 py-2 border-b border-gray-200">Bulan</th>
                                                <th className="px-3 py-2 border-b border-gray-200 text-right">Nominal</th>
                                                <th className="px-3 py-2 border-b border-gray-200 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {invoices.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                                        Belum ada tagihan iuran terbentuk.
                                                    </td>
                                                </tr>
                                            ) : (
                                                invoices.map((invoice, index) => {
                                                    const color = STATUS_CONFIG[invoice.status]?.className || 'bg-gray-100 text-gray-800'
                                                    const label = STATUS_CONFIG[invoice.status]?.label || invoice.status

                                                    return (
                                                        <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-3 py-2.5 font-medium text-gray-400">{index + 1}</td>
                                                            <td className="px-3 py-2.5 font-bold">{BULAN_ID[invoice.period_month]} {invoice.period_year}</td>
                                                            <td className="px-3 py-2.5 text-right font-medium">Rp {invoice.amount.toLocaleString('id-ID')}</td>
                                                            <td className="px-3 py-2.5 text-center">
                                                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold mx-auto w-fit ${color}`}>
                                                                    {label}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <p className="text-[10px] text-center text-gray-400 mt-6 pt-4 border-t border-black/10">
                                    Kartu ini digunakan sebagai ringkasan resmi tagihan dan pembayaran siswa.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center no-print">
                            <PrintKartuIuranButton />
                        </div>
                    </div>
                ) : selectedProfile ? (
                    <div className="text-center py-16 text-muted-foreground bg-muted/20 border border-dashed border-border/80 rounded-2xl no-print">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <h3 className="h5 mb-1">Data Tidak Lengkap</h3>
                        <p className="body-sm">Siswa tersebut mungkin tidak lagi aktif di sesi ini.</p>
                    </div>
                ) : (
                    <div className="text-center py-16 text-muted-foreground bg-muted/20 border border-dashed border-border/80 rounded-2xl no-print">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <h3 className="h5 mb-1">Pilih Siswa</h3>
                        <p className="body-sm">Filter sesi dan nama siswa di atas untuk memunculkan kartu iuran.</p>
                    </div>
                )}
            </div>
        </>
    )
}
