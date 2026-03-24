import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import {
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    Filter,
    Receipt,
    TrendingUp,
    XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentProof } from '@/lib/actions/payment'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Keuangan | Admin' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

type PendingProofRow = {
    id: string
    invoice_id: string
    file_url: string
    period_month: number
    period_year: number
    amount: number
    created_at: string
    officer_name: string | null
    profiles: { full_name: string } | null
    invoices: { invoice_number: string } | null
}

type RecentInvoiceRow = {
    id: string
    invoice_number: string
    amount: number
    status: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'OVERDUE'
    profiles: { full_name: string } | null
}

type VerifiedProofRow = {
    id: string
    file_url: string
    amount: number
    verified_at: string | null
    profiles: { full_name: string } | null
    invoices: { invoice_number: string } | null
}

function getInvoiceBadgeVariant(status: RecentInvoiceRow['status']) {
    if (status === 'PAID') return 'default'
    if (status === 'OVERDUE') return 'destructive'
    if (status === 'PENDING_VERIFICATION') return 'secondary'
    return 'outline'
}

export default async function AdminKeuanganPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const now = new Date()
    const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const selectedPeriod = params.period ?? defaultPeriod

    const [yearStr, monthStr] = selectedPeriod.split('-')
    const filterYear = Number.parseInt(yearStr, 10)
    const filterMonth = Number.parseInt(monthStr, 10)

    const [
        paidResult,
        unpaidResult,
        pendingProofCountResult,
        pendingProofsResult,
        recentInvoicesResult,
        recentProofsResult,
    ] = await Promise.all([
        supabase
            .from('invoices')
            .select('amount')
            .eq('status', 'PAID')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .returns<{ amount: number }[]>(),
        supabase
            .from('invoices')
            .select('amount')
            .in('status', ['UNPAID', 'OVERDUE'])
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .returns<{ amount: number }[]>(),
        supabase.from('payment_proofs').select('id', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase
            .from('payment_proofs')
            .select(`
                id,
                invoice_id,
                file_url,
                period_month,
                period_year,
                amount,
                created_at,
                officer_name,
                profiles:uploaded_by(full_name),
                invoices(invoice_number)
            `)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .returns<PendingProofRow[]>(),
        supabase
            .from('invoices')
            .select('id, invoice_number, amount, status, profiles(full_name)')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .order('created_at', { ascending: false })
            .limit(5)
            .returns<RecentInvoiceRow[]>(),
        supabase
            .from('payment_proofs')
            .select('id, file_url, amount, verified_at, profiles:uploaded_by(full_name), invoices(invoice_number)')
            .eq('status', 'VERIFIED')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .order('verified_at', { ascending: false })
            .limit(5)
            .returns<VerifiedProofRow[]>(),
    ])

    const totalPemasukan = (paidResult.data ?? []).reduce((sum, row) => sum + row.amount, 0)
    const totalTunggakan = (unpaidResult.data ?? []).reduce((sum, row) => sum + row.amount, 0)
    const pendingProofs = pendingProofsResult.data ?? []
    const recentInvoices = recentInvoicesResult.data ?? []
    const recentProofs = recentProofsResult.data ?? []

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Rekap Keuangan</h1>
                    <p className="text-sm text-muted-foreground">
                        Statistik pemasukan, tunggakan, dan antrean verifikasi pembayaran.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Filter className="h-4 w-4 text-primary" />
                        Filter Periode Iuran
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <form method="GET" className="flex max-w-sm items-end gap-3">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Bulan / Tahun
                            </label>
                            <input
                                type="month"
                                name="period"
                                defaultValue={selectedPeriod}
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <button
                            type="submit"
                            className="h-[38px] rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-hover hover:bg-primary/90 hover:shadow-md"
                        >
                            Terapkan
                        </button>
                    </form>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="border-success/20 bg-success/5 transition-hover hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/20">
                            <TrendingUp className="h-5 w-5 text-success-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                                Masuk ({MONTHS[filterMonth - 1]} {filterYear})
                            </p>
                            <p className="truncate text-lg font-bold text-success-foreground">
                                Rp {totalPemasukan.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 transition-hover hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/20">
                            <CreditCard className="h-5 w-5 text-destructive-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                                Tunggakan ({MONTHS[filterMonth - 1]} {filterYear})
                            </p>
                            <p className="truncate text-lg font-bold text-destructive-foreground">
                                Rp {totalTunggakan.toLocaleString('id-ID')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warning/20 bg-warning/5 transition-hover hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/20">
                            <Clock className="h-5 w-5 text-warning-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-xs uppercase tracking-wider text-muted-foreground">
                                Menunggu Verifikasi
                            </p>
                            <p className="truncate text-lg font-bold text-warning-foreground">
                                {pendingProofCountResult.count ?? 0} Bukti Antre
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="border-b border-border/40 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <DollarSign className="h-5 w-5 text-primary" />
                        Antrean Verifikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {pendingProofs.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground">
                            <CheckCircle className="mx-auto mb-2 h-10 w-10 opacity-20" />
                            <p className="text-sm">Tidak ada bukti pembayaran yang menunggu verifikasi.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingProofs.map((proof) => (
                                <div key={proof.id} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">{proof.profiles?.full_name ?? '-'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {proof.invoices?.invoice_number ?? '-'} · Iuran {MONTHS[proof.period_month - 1]} {proof.period_year}
                                            </p>
                                            <p className="text-sm font-semibold">Rp {proof.amount.toLocaleString('id-ID')}</p>
                                            {proof.officer_name ? (
                                                <p className="text-xs text-muted-foreground">Petugas CSO: {proof.officer_name}</p>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-col gap-3 sm:items-end">
                                            <Link
                                                href={proof.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:underline"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Lihat Bukti Gambar
                                            </Link>
                                            <div className="flex gap-2">
                                                <form
                                                    action={async () => {
                                                        'use server'
                                                        await verifyPaymentProof(proof.id, proof.invoice_id, 'VERIFIED')
                                                    }}
                                                >
                                                    <Button size="sm" className="h-8 bg-success text-xs text-success-foreground hover:bg-success/90">
                                                        <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                                        Terima
                                                    </Button>
                                                </form>
                                                <form
                                                    action={async () => {
                                                        'use server'
                                                        await verifyPaymentProof(proof.id, proof.invoice_id, 'REJECTED', 'Bukti kurang jelas')
                                                    }}
                                                >
                                                    <Button size="sm" variant="destructive" className="h-8 text-xs">
                                                        <XCircle className="mr-1 h-3.5 w-3.5" />
                                                        Tolak
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="border-b border-border/40 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Receipt className="h-5 w-5 text-primary" />
                            Invoice Terbaru di Periode Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            {recentInvoices.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">Belum ada invoice dibuat.</p>
                            ) : (
                                recentInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex items-center justify-between p-4 text-sm transition-colors hover:bg-muted/30">
                                        <div>
                                            <p className="font-medium">{invoice.profiles?.full_name ?? '-'}</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">{invoice.invoice_number}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                                            <Badge variant={getInvoiceBadgeVariant(invoice.status)} className="mt-1 text-[10px] font-medium">
                                                {invoice.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-border/40 pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle className="h-5 w-5 text-success-foreground" />
                            Pembayaran Terverifikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            {recentProofs.length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">Belum ada pembayaran lunas.</p>
                            ) : (
                                recentProofs.map((proof) => (
                                    <div key={proof.id} className="flex items-center justify-between p-4 text-sm transition-colors hover:bg-muted/30">
                                        <div>
                                            <p className="font-medium">{proof.profiles?.full_name ?? '-'}</p>
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                                <CheckCircle className="h-3 w-3 text-success-foreground" />
                                                {proof.verified_at
                                                    ? new Date(proof.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                                                    : '-'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-success-foreground">Rp {proof.amount.toLocaleString('id-ID')}</p>
                                            <Link href={proof.file_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[10px] text-primary hover:underline">
                                                Ref: {proof.invoices?.invoice_number?.slice(-6) ?? '-'}
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
