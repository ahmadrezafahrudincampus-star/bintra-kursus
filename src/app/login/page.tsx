import Link from 'next/link'
import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/AuthShell'
import { LoginForm } from '@/components/auth/LoginForm'
import { sanitizeRedirectPath } from '@/lib/auth/redirect'

export const metadata: Metadata = {
    title: 'Login',
    description: 'Masuk ke akun Kursus Komputer Anda',
}

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ redirectTo?: string; authError?: string }>
}) {
    const params = await searchParams
    const redirectTo = sanitizeRedirectPath(params.redirectTo)

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
            <LoginForm redirectTo={redirectTo} authError={params.authError ?? null} />
        </AuthShell>
    )
}
