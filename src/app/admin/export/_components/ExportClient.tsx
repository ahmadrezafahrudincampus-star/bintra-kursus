'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DownloadCloud, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { exportInvoicesAsCSV } from '@/lib/actions/export'

export function ExportClient() {
    const [loading, setLoading] = useState<string | null>(null)

    const handleExport = async (type: 'all' | 'unpaid' | 'verified', filename: string) => {
        try {
            setLoading(type)
            const csvText = await exportInvoicesAsCSV(type)
            if (!csvText) {
                alert('Tidak ada data untuk di-export.')
                return
            }

            // Create Blob
            const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Export gagal:', error)
            alert('Terjadi kesalahan saat mengekspor data.')
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="transition-hover hover:border-primary/50">
                <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="h5">Semua Tagihan</CardTitle>
                    <CardDescription className="body-sm">Export daftar lengkap seluruh tagihan (invoice) beserta status pembayarannya (lunas/belum).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => handleExport('all', 'Semua_Tagihan')}
                        disabled={loading !== null}
                        className="w-full"
                    >
                        {loading === 'all' ? 'Mengekspor...' : 'Export ke CSV'}
                    </Button>
                </CardContent>
            </Card>

            <Card className="transition-hover hover:border-destructive/50">
                <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                    </div>
                    <CardTitle className="h5">Daftar Tunggakan</CardTitle>
                    <CardDescription className="body-sm">Export daftar siswa yang memiliki tagihan dengan status belum bayar atau sudah melewati jatuh tempo.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => handleExport('unpaid', 'Daftar_Tunggakan')}
                        disabled={loading !== null}
                        variant="destructive"
                        className="w-full"
                    >
                        {loading === 'unpaid' ? 'Mengekspor...' : 'Export ke CSV'}
                    </Button>
                </CardContent>
            </Card>

            <Card className="transition-hover hover:border-success/50">
                <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                        <CheckCircle className="w-6 h-6 text-success-foreground" />
                    </div>
                    <CardTitle className="h5">Pembayaran Selesai</CardTitle>
                    <CardDescription className="body-sm">Export daftar pembayaran yang telah diverifikasi sebagai lunas untuk pelaporan administrasi periodik.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => handleExport('verified', 'Pembayaran_Lunas')}
                        disabled={loading !== null}
                        className="w-full bg-success hover:bg-success/90 text-success-foreground"
                    >
                        {loading === 'verified' ? 'Mengekspor...' : 'Export ke CSV'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
