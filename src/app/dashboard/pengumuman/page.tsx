import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pengumuman' }

export default function DashboardPengumumanPage() {
    return <ComingSoon title="Pengumuman" description="Pengumuman dari lembaga kursus akan segera hadir." backUrl="/dashboard" backLabel="Kembali ke Dashboard" />
}
