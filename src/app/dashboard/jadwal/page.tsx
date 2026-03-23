import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Jadwal Kelas' }

export default function DashboardJadwalPage() {
    return <ComingSoon title="Jadwal Kelas" description="Jadwal kelas akan segera hadir." backUrl="/dashboard" backLabel="Kembali ke Dashboard" />
}
