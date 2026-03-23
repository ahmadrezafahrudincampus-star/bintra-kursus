import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
    title: 'Buat Akun',
    description: 'Daftar untuk mulai belajar di Kursus Komputer',
}

export default function RegisterPage() {
    return (
        <AuthShell
            mode="register"
            title="Buat Akun Baru"
            subtitle={
                <>
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-[--primary] hover:underline">
                        Masuk di sini
                    </Link>
                </>
            }
        >
            <RegisterForm />
        </AuthShell>
    )
}
