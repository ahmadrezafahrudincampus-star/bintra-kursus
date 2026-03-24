'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react'
import { signIn } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthSocialButtons } from '@/components/auth/AuthSocialButtons'

const loginSchema = z.object({
    email: z.string().email('Masukkan email yang valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>
type LoginFormProps = {
    redirectTo?: string | null
    authError?: string | null
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null

    return <p className="text-xs font-medium text-red-500">{message}</p>
}

export function LoginForm({ redirectTo, authError }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleForgotPassword = () => {
        toast('Fitur reset password akan segera tersedia.')
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            rememberMe: true,
        },
    })

    useEffect(() => {
        if (authError) {
            toast.error(authError)
        }
    }, [authError])

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const result = await signIn({
                ...data,
                redirectTo,
            })
            if (result?.error) {
                toast.error(result.error)
            }
        } catch {
            // Redirect handled by server action
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AuthSocialButtons mode="login" redirectTo={redirectTo} />

            <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[color:var(--brand-100)]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    atau masuk dengan email
                </span>
                <div className="h-px flex-1 bg-[color:var(--brand-100)]" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="text-[13px] font-semibold text-slate-600">
                    Email
                </Label>
                <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="email@kamu.com"
                        autoComplete="email"
                        aria-invalid={Boolean(errors.email)}
                        {...register('email')}
                        className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                    />
                </div>
                <FieldError message={errors.email?.message} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[13px] font-semibold text-slate-600">
                        Password
                    </Label>
                    <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-xs font-semibold text-[--primary] hover:underline"
                    >
                        Lupa password?
                    </button>
                </div>
                <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Masukkan password"
                        autoComplete="current-password"
                        aria-invalid={Boolean(errors.password)}
                        {...register('password')}
                        className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-12 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[--primary]"
                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
                <FieldError message={errors.password?.message} />
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[--primary] focus:ring-[--primary]"
                />
                <span>Ingat saya di perangkat ini</span>
            </label>

            <Button
                type="submit"
                disabled={isLoading}
                className="h-[52px] w-full rounded-2xl bg-[linear-gradient(135deg,_var(--primary),_#3b6eff,_var(--accent))] text-sm font-bold text-white shadow-[0_20px_45px_rgba(26,86,255,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                    </>
                ) : (
                    'Masuk ke Akun'
                )}
            </Button>
        </form>
    )
}
