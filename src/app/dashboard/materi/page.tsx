import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Akses Materi' }

export default function DashboardMateriPage() {
    return <ComingSoon title="Akses Materi" description="Materi kursus interaktif akan segera hadir." backUrl="/dashboard" backLabel="Kembali ke Dashboard" />
}
