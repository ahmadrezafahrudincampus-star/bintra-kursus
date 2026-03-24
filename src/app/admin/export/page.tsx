import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ExportClient } from './_components/ExportClient'

export const metadata: Metadata = { title: 'Export Laporan | Admin' }

export default async function AdminExportPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    return (
        <div className="max-w-5xl space-y-6">
            <div>
                <h1 className="h2 mb-1">Export Laporan</h1>
                <p className="body-sm text-muted-foreground">
                    Unduh laporan keuangan dan status tagihan siswa dalam format CSV / Excel.
                </p>
            </div>

            <ExportClient />
        </div>
    )
}
