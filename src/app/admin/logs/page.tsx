import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Log Aktivitas' }

export default function AdminLogsPage() {
    return <ComingSoon title="Log Aktivitas" description="Audit trail aktivitas sistem akan segera hadir." backUrl="/admin" backLabel="Kembali ke Dashboard Admin" />
}
