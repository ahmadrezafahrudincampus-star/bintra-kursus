import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CreditCard, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Status Iuran' }

const INVOICE_STATUS = {
    UNPAID: { label: 'Belum Bayar', variant: 'outline' as const, icon: AlertCircle, color: 'text-orange-600' },
    PENDING_VERIFICATION: { label: 'Menunggu Verifikasi', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
    PAID: { label: 'Lunas', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    OVERDUE: { label: 'Jatuh Tempo', variant: 'destructive' as const, icon: AlertCircle, color: 'text-red-600' },
}

interface InvoiceList {
    id: string
    invoice_number: string | null
    amount: number
    period_month: number
    period_year: number
    due_date: string
    status: string
    paid_at: string | null
    notes: string | null
    payment_proofs: { id: string; file_url: string; status: string; admin_note: string | null; created_at: string }[] | null
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export default async function IuranPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: invoices } = await supabase
        .from('invoices')
        .select(`
            id, invoice_number, amount, period_month, period_year,
            due_date, status, paid_at, notes,
            payment_proofs(id, file_url, status, admin_note, created_at)
        `)
        .eq('profile_id', user.id)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false })

    const invoicesData = (invoices ?? []) as InvoiceList[]

    const unpaidTotal = invoicesData
        .filter((invoice) => ['UNPAID', 'OVERDUE'].includes(invoice.status))
        .reduce((sum, invoice) => sum + invoice.amount, 0)

    const firstUploadTarget = invoicesData.find((invoice) => {
        const latestProof = invoice.payment_proofs?.[0] ?? null
        return invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' || latestProof?.status === 'REJECTED'
    })

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Status Iuran</h1>
                    <p className="text-muted-foreground mt-1">Daftar tagihan iuran dan status pembayarannya.</p>
                </div>
                {unpaidTotal > 0 && firstUploadTarget && (
                    <Button asChild>
                        <Link href={`/dashboard/upload-kartu?invoice_id=${firstUploadTarget.id}`}>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Bukti
                        </Link>
                    </Button>
                )}
            </div>

            {unpaidTotal > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                            <div>
                                <p className="font-semibold text-orange-800">Total Belum Lunas</p>
                                <p className="text-xs text-orange-600">Segera lakukan pembayaran untuk tagihan aktif.</p>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-orange-700">
                            Rp {unpaidTotal.toLocaleString('id-ID')}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Daftar Tagihan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {invoicesData.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">Belum ada tagihan iuran.</p>
                        </div>
                    ) : (
                        invoicesData.map((invoice) => {
                            const config = INVOICE_STATUS[invoice.status as keyof typeof INVOICE_STATUS] ?? INVOICE_STATUS.UNPAID
                            const Icon = config.icon
                            const latestProof = invoice.payment_proofs?.[0] ?? null

                            return (
                                <div key={invoice.id} className="border border-border/60 rounded-xl p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center ${config.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">
                                                    Iuran {MONTHS[invoice.period_month - 1]} {invoice.period_year}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {invoice.invoice_number} · Jatuh tempo: {new Date(invoice.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">Rp {invoice.amount.toLocaleString('id-ID')}</p>
                                            <Badge variant={config.variant} className="text-xs mt-1">{config.label}</Badge>
                                        </div>
                                    </div>

                                    {latestProof && (
                                        <div className={`text-xs rounded-lg p-2.5 ${latestProof.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                                            {latestProof.status === 'PENDING' && 'Bukti diunggah dan sedang menunggu verifikasi admin.'}
                                            {latestProof.status === 'REJECTED' && `Bukti ditolak: ${latestProof.admin_note ?? 'Tidak ada keterangan'}`}
                                        </div>
                                    )}

                                    {(invoice.status === 'UNPAID' || invoice.status === 'OVERDUE' || latestProof?.status === 'REJECTED') && (
                                        <Button size="sm" variant="outline" asChild className="w-full">
                                            <Link href={`/dashboard/upload-kartu?invoice_id=${invoice.id}`}>
                                                <Upload className="w-3.5 h-3.5 mr-1.5" />
                                                {latestProof?.status === 'REJECTED' ? 'Upload Ulang Bukti' : 'Upload Bukti Pembayaran'}
                                            </Link>
                                        </Button>
                                    )}

                                    {invoice.status === 'PAID' && invoice.paid_at && (
                                        <p className="text-xs text-green-600 text-center pt-1">
                                            Lunas pada {new Date(invoice.paid_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
