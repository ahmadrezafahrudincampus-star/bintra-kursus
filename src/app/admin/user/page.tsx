import { ComingSoon } from '@/components/ui/coming-soon'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola User' }

export default function AdminUserPage() {
    return <ComingSoon title="Kelola User" description="Manajemen akun pengguna akan segera hadir." backUrl="/admin" backLabel="Kembali ke Dashboard Admin" />
}
