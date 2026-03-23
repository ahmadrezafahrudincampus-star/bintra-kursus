import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sesi Kelas' }

export default function AdminSesiPage() {
    return <ComingSoon title="Sesi Kelas" description="Manajemen sesi kelas akan segera hadir." backUrl="/admin" backLabel="Kembali ke Dashboard Admin" />
}
