import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pengaturan Akun' }

export default function DashboardPengaturanPage() {
    return <ComingSoon title="Pengaturan Akun" description="Fitur ubah password dan preferensi akun akan segera hadir." backUrl="/dashboard" backLabel="Kembali ke Dashboard" />
}
