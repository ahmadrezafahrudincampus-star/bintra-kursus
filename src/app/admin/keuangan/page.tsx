import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
    DollarSign, TrendingUp, CreditCard, Clock,
    CheckCircle, XCircle, Eye, Filter, Receipt
} from 'lucide-react'
import { verifyPaymentProof } from '@/lib/actions/payment'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Keuangan | Admin' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default async function AdminKeuanganPage({
    searchParams
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const params = await searchParams
    const now = new Date()
    const defaultPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const selectedPeriod = params.period ?? defaultPeriod

    const [yearStr, monthStr] = selectedPeriod.split('-')
    const filterYear = parseInt(yearStr, 10)
    const filterMonth = parseInt(monthStr, 10)

    // Data Aggregation
    const [paidResult, unpaidResult, pendingResult, pendingProofsResult, recentInvoicesResult, recentProofsResult] = await Promise.all([
        // Total pemasukan di bulan/tahun yang dipilih
        supabase.from('invoices')
            .select('amount')
            .eq('status', 'PAID')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .returns<{ amount: number }[]>(),

        // Total tunggakan (global atau bisa juga spesifik, kita buat spesifik bulan/tahun yang difilter agar relevan)
        supabase.from('invoices')
            .select('amount', { count: 'exact' })
            .in('status', ['UNPAID', 'OVERDUE'])
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .returns<{ amount: number }[]>(),

        // Bukti pembayaran menunggu verifikasi (Global karena butuh immediate action)
        supabase.from('payment_proofs')
            .select('id', { count: 'exact' })
            .eq('status', 'PENDING'),

        // Detail bukti PENDING (Global)
        supabase.from('payment_proofs')
            .select(`
                id, invoice_id, file_url, period_month, period_year, amount,
                status, created_at, officer_name,
                profiles:uploaded_by(full_name),
                invoices(invoice_number)
            `)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .returns<any[]>(),

        // Invoice terbaru di bulan tersebut
        supabase.from('invoices')
            .select('id, invoice_number, amount, status, profiles(full_name)')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .order('created_at', { ascending: false })
            .limit(5)
            .returns<any[]>(),

        // Pembayaran terverifikasi terbaru di bulan tersebut
        supabase.from('payment_proofs')
            .select('id, file_url, amount, verified_at, profiles:uploaded_by(full_name), invoices(invoice_number)')
            .eq('status', 'VERIFIED')
            .eq('period_year', filterYear)
            .eq('period_month', filterMonth)
            .order('verified_at', { ascending: false })
            .limit(5)
            .returns<any[]>()
    ])

    const totalPemasukan = (paidResult.data ?? []).reduce((sum, r) => sum + r.amount, 0)
    const totalTunggakan = (unpaidResult.data ?? []).reduce((sum, r) => sum + r.amount, 0)
    const pendingProofs = (pendingProofsResult.data ?? [])
    const recentInvoices = (recentInvoicesResult.data ?? [])
    const recentProofs = (recentProofsResult.data ?? [])

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="h2 mb-1">Rekap Keuangan</h1>
                    <p className="body-sm text-muted-foreground">Statistik pemasukan dan verifikasi bukti pembayaran</p>
                </div>
            </div>

            {/* Filter */}
            <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Filter className="w-4 h-4 text-primary" />
                        Filter Periode Iuran
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <form method="GET" className="flex items-end gap-3 max-w-sm">
                        <div className="flex-1 space-y-1">
                            <label className="label-sm text-muted-foreground uppercase tracking-wider">Bulan / Tahun</label>
                            <input
                                type="month"
                                name="period"
                                defaultValue={selectedPeriod}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-5 py-2 h-[38px] bg-primary text-primary-foreground rounded-lg text-sm font-medium transition-hover hover:bg-primary/90 hover:shadow-md"
                        >
                            Terapkan
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-success/20 bg-success/5 transition-hover hover:shadow-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-success-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="caption text-muted-foreground uppercase tracking-wider truncate">Masuk ({MONTHS[filterMonth - 1]} {filterYear})</p>
                            <p className="text-lg font-bold text-success-foreground truncate">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-destructive/20 bg-destructive/5 transition-hover hover:shadow-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-destructive-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="caption text-muted-foreground uppercase tracking-wider truncate">Tunggakan ({MONTHS[filterMonth - 1]} {filterYear})</p>
                            <p className="text-lg font-bold text-destructive-foreground truncate">Rp {totalTunggakan.toLocaleString('id-ID')}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-warning/20 bg-warning/5 transition-hover hover:shadow-md">
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-warning-foreground" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="caption text-muted-foreground uppercase tracking-wider truncate">Menunggu Verifikasi</p>
                            <p className="text-lg font-bold text-warning-foreground truncate">{pendingResult.count ?? 0} Bukti Antre</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Verifikasi Bukti */}
            <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="h5 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Antrean Verifikasi (Semua Bulan)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    {pendingProofs.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="body-sm">Tidak ada bukti pembayaran yang menunggu verifikasi.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingProofs.map((proof) => (
                                <div key={proof.id} className="border border-border/60 rounded-xl p-4 bg-muted/20">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">{proof.profiles?.full_name ?? '—'}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {proof.invoices?.invoice_number} · Iuran {MONTHS[proof.period_month - 1]} {proof.period_year}
                                            </p>
                                            <p className="text-sm font-semibold">Rp {proof.amount.toLocaleString('id-ID')}</p>
                                            {proof.officer_name && (
                                                <p className="text-xs text-muted-foreground">Petugas CSO: {proof.officer_name}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-3">
                                            <a
                                                href={proof.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium bg-primary/10 px-3 py-1.5 rounded-full w-fit"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Lihat Bukti Gambar
                                            </a>
                                            <div className="flex gap-2">
                                                <form action={async () => {
                                                    'use server'
                                                    await verifyPaymentProof(proof.id, proof.invoice_id, 'VERIFIED')
                                                }}>
                                                    <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground h-8 text-xs">
                                                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                                        Terima
                                                    </Button>
                                                </form>
                                                <form action={async () => {
                                                    'use server'
                                                    await verifyPaymentProof(proof.id, proof.invoice_id, 'REJECTED', 'Bukti kurang jelas')
                                                }}>
                                                    <Button size="sm" variant="destructive" className="h-8 text-xs">
                                                        <XCircle className="w-3.5 h-3.5 mr-1" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daftar Invoice Terbaru */}
                <Card>
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="h5 flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary" />
                            Invoice Terbaru di Periode Ini
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            {recentInvoices.length === 0 ? (
                                <p className="text-sm text-center py-6 text-muted-foreground">Belum ada invoice dibuat.</p>
                            ) : recentInvoices.map((inv: any) => (
                                <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-sm">
                                    <div>
                                        <p className="font-medium">{inv.profiles?.full_name}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{inv.invoice_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">Rp {inv.amount.toLocaleString('id-ID')}</p>
                                        <Badge variant={inv.status === 'PAID' ? 'default' : inv.status === 'OVERDUE' ? 'destructive' : 'secondary'} className="text-[10px] mt-1 font-medium">
                                            {inv.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pembayaran Terverifikasi Terbaru */}
                <Card>
                    <CardHeader className="pb-3 border-b border-border/40">
                        <CardTitle className="h5 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-success-foreground" />
                            Pembayaran Terverifikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/60">
                            {recentProofs.length === 0 ? (
                                <p className="text-sm text-center py-6 text-muted-foreground">Belum ada pembayaran lunas.</p>
                            ) : recentProofs.map((proof: any) => (
                                <div key={proof.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-sm">
                                    <div>
                                        <p className="font-medium">{proof.profiles?.full_name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <CheckCircle className="w-3 h-3 text-success-foreground" />
                                            {new Date(proof.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-success-foreground">Rp {proof.amount.toLocaleString('id-ID')}</p>
                                        <a href={proof.file_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline mt-1 inline-block">Ref: {proof.invoices?.invoice_number?.slice(-6)}</a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
