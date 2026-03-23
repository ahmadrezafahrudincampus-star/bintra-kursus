import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
    title: 'Login',
    description: 'Masuk ke akun Kursus Komputer Anda',
}

export default function LoginPage() {
    return (
        <AuthShell
            mode="login"
            title="Masuk ke Akun"
            subtitle={
                <>
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-[--primary] hover:underline">
                        Daftar Sekarang
                    </Link>
                </>
            }
        >
            <LoginForm />
        </AuthShell>
    )
}
