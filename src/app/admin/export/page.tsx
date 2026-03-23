import { ExportClient } from './_components/ExportClient'
import { Card, CardContent } from '@/components/ui/card'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Export Laporan | Admin' }

export default function AdminExportPage() {
    return (
        <div className="space-y-6 max-w-5xl">
            <div>
                <h1 className="h2 mb-1">Export Laporan</h1>
                <p className="body-sm text-muted-foreground">Unduh laporan keuangan dan status tagihan siswa dalam format CSV / Excel.</p>
            </div>

            <ExportClient />
        </div>
    )
}
