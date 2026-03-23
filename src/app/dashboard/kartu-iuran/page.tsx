import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CreditCard, FileX } from 'lucide-react'
import Link from 'next/link'
import { PrintKartuIuranButton } from '@/components/dashboard/PrintKartuIuranButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kartu Iuran' }

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PAID: { label: 'LUNAS', className: 'bg-green-100 text-green-800 border border-green-300' },
    PENDING_VERIFICATION: { label: 'PENDING VERIFIKASI', className: 'bg-yellow-100 text-yellow-800 border border-yellow-300' },
    UNPAID: { label: 'BELUM BAYAR', className: 'bg-orange-100 text-orange-800 border border-orange-300' },
    OVERDUE: { label: 'JATUH TEMPO', className: 'bg-red-100 text-red-800 border border-red-300' },
}

const BULAN_ID = [
    '',
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
]

interface ProfileData {
    full_name: string
    phone: string | null
}

interface EnrollmentData {
    id: string
    sessions: {
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        course_master: { name: string } | null
    } | null
}

interface InvoiceData {
    id: string
    amount: number
    status: string
    period_month: number
    period_year: number
    due_date: string
    invoice_number: string
}

export default async function KartuIuranPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const [{ data: profile }, { data: enrollment }, { data: invoices }] = await Promise.all([
        supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .returns<ProfileData[]>()
            .single(),
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
            .eq('profile_id', user.id)
            .eq('status', 'ACTIVE')
            .limit(1)
            .returns<EnrollmentData[]>()
            .maybeSingle(),
        supabase
            .from('invoices')
            .select('id, amount, status, period_month, period_year, due_date, invoice_number')
            .eq('profile_id', user.id)
            .order('period_year', { ascending: true })
            .order('period_month', { ascending: true })
            .returns<InvoiceData[]>(),
    ])

    const fullName = profile?.full_name ?? '-'
    const phone = profile?.phone ?? null
    const courseName = enrollment?.sessions?.course_master?.name ?? '-'
    const sessionName = enrollment?.sessions?.name ?? '-'
    const allInvoices = invoices ?? []

    const cetakDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    })

    return (
        <>
            <style>{`
                @page {
                    size: A5 landscape;
                    margin: 10mm;
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

                    .print-shell {
                        max-width: none !important;
                        width: 100% !important;
                    }

                    .print-card {
                        box-shadow: none !important;
                        border: 1px solid #d4d4d8 !important;
                    }

                    .print-table {
                        font-size: 11px !important;
                    }
                }
            `}</style>

            <div className="space-y-4 max-w-3xl print-shell">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
                    <div>
                        <h1 className="text-2xl font-bold">Kartu Iuran</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Cetak kartu sebagai ringkasan seluruh riwayat iuran Anda.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/iuran">
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Kembali
                            </Link>
                        </Button>
                        {allInvoices.length > 0 && <PrintKartuIuranButton />}
                    </div>
                </div>

                {allInvoices.length === 0 ? (
                    <Card className="no-print">
                        <CardContent className="py-16 text-center text-muted-foreground">
                            <FileX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p className="font-semibold">Belum ada kartu iuran</p>
                            <p className="text-sm mt-1">
                                Kartu iuran akan muncul setelah tagihan pertama dibuat untuk akun Anda.
                            </p>
                            <Button variant="outline" className="mt-4" asChild>
                                <Link href="/dashboard">Kembali ke Dashboard</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="print-card">
                        <CardHeader className="pb-4 border-b">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                                        <CreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold leading-tight">
                                            Kartu Iuran Kursus Komputer
                                        </CardTitle>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Dicetak: {cetakDate}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground w-20 shrink-0">Nama</span>
                                    <span className="font-semibold">: {fullName}</span>
                                </div>
                                {phone && (
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground w-20 shrink-0">No. HP</span>
                                        <span className="font-semibold">: {phone}</span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground w-20 shrink-0">Kursus</span>
                                    <span className="font-semibold">: {courseName}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-muted-foreground w-20 shrink-0">Sesi</span>
                                    <span className="font-semibold">: {sessionName}</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-4">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm print-table">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground w-10">No</th>
                                            <th className="text-left py-2 pr-3 text-xs font-semibold text-muted-foreground">Bulan</th>
                                            <th className="text-right py-2 pr-3 text-xs font-semibold text-muted-foreground">Nominal</th>
                                            <th className="text-center py-2 text-xs font-semibold text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allInvoices.map((invoice, index) => {
                                            const statusCfg = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.UNPAID

                                            return (
                                                <tr key={invoice.id} className="border-b border-border/50 last:border-0">
                                                    <td className="py-2.5 pr-3 text-muted-foreground text-xs">{index + 1}</td>
                                                    <td className="py-2.5 pr-3 font-medium">
                                                        {BULAN_ID[invoice.period_month]} {invoice.period_year}
                                                    </td>
                                                    <td className="py-2.5 pr-3 text-right font-semibold">
                                                        Rp {invoice.amount.toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="py-2.5 text-center">
                                                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.className}`}>
                                                            {statusCfg.label}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t-2 border-border">
                                            <td colSpan={2} className="pt-3 text-xs text-muted-foreground font-medium">
                                                Total {allInvoices.length} tagihan
                                            </td>
                                            <td className="pt-3 text-right font-bold text-sm">
                                                Rp {allInvoices.reduce((sum, invoice) => sum + invoice.amount, 0).toLocaleString('id-ID')}
                                            </td>
                                            <td />
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            <div className="mt-6 pt-4 border-t border-dashed border-border/60 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                                <span>Kursus Komputer - Platform Edukasi Digital</span>
                                <span>Dicetak: {cetakDate}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    )
}
