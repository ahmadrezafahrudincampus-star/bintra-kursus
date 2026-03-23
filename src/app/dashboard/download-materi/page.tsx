import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Download Materi' }

export default function DashboardDownloadMateriPage() {
    return <ComingSoon title="Download Materi" description="File materi kursus (PDF, PPT) akan segera hadir." backUrl="/dashboard" backLabel="Kembali ke Dashboard" />
}
