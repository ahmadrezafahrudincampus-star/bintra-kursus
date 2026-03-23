import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pengaturan Admin' }

export default function AdminPengaturanPage() {
    return <ComingSoon title="Pengaturan Admin" description="Konfigurasi sistem akan segera hadir." backUrl="/admin" backLabel="Kembali ke Dashboard Admin" />
}
