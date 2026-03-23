import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Receipt, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Histori Pembayaran | Siswa' }

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export default async function HistoriIuranPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: proofs } = await supabase
        .from('payment_proofs')
        .select(`
            id,
            period_month,
            period_year,
            amount,
            status,
            admin_note,
            created_at,
            verified_at
        `)
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="h2 mb-1">Histori Pembayaran</h1>
                <p className="body-sm text-muted-foreground">
                    Riwayat seluruh bukti transfer iuran yang pernah Anda unggah.
                </p>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-border/40">
                    <CardTitle className="h5 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-primary" />
                        Daftar Bukti Bayar
                    </CardTitle>
                    <CardDescription className="body-sm">
                        Total {proofs?.length || 0} riwayat pembayaran tercatat.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {!proofs || proofs.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground px-4">
                            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <h3 className="h5 mb-1">Belum Ada Histori</h3>
                            <p className="body-sm">Anda belum pernah mengunggah bukti pembayaran.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/60">
                            {proofs.map((proof: any) => {
                                const isPending = proof.status === 'PENDING'
                                const isVerified = proof.status === 'VERIFIED'
                                const isRejected = proof.status === 'REJECTED'

                                return (
                                    <div key={proof.id} className="p-5 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-base flex items-center gap-1.5">
                                                    Iuran {MONTHS[proof.period_month - 1]} {proof.period_year}
                                                </h3>
                                                {isPending && (
                                                    <Badge variant="secondary" className="text-xs font-medium">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        Menunggu
                                                    </Badge>
                                                )}
                                                {isVerified && (
                                                    <Badge variant="default" className="bg-success text-success-foreground hover:bg-success/90 text-xs font-medium">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        Selesai
                                                    </Badge>
                                                )}
                                                {isRejected && (
                                                    <Badge variant="destructive" className="text-xs font-medium">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Ditolak
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">Rp {proof.amount.toLocaleString('id-ID')}</p>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    Diunggah: {new Date(proof.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                                {proof.verified_at && (
                                                    <span className="flex items-center gap-1 opacity-75">
                                                        Diverifikasi: {new Date(proof.verified_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {isRejected && proof.admin_note && (
                                            <div className="bg-destructive/5 text-destructive-foreground border border-destructive/20 text-xs rounded-lg p-3 sm:max-w-xs mt-2 sm:mt-0">
                                                <strong>Catatan Admin:</strong> {proof.admin_note}
                                            </div>
                                        )}
                                        {isPending && (
                                            <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3 sm:max-w-xs mt-2 sm:mt-0 border border-border/40">
                                                Bukti sedang dalam antrean verifikasi oleh admin.
                                            </div>
                                        )}
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
