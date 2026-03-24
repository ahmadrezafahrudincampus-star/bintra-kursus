'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
    Check,
    Eye,
    EyeOff,
    Loader2,
    LockKeyhole,
    Mail,
    Phone,
    UserRound,
} from 'lucide-react'
import { signUp } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const registerSchema = z
    .object({
        full_name: z.string().min(3, 'Nama minimal 3 karakter'),
        email: z.string().email('Masukkan email yang valid'),
        phone: z
            .string()
            .min(10, 'Nomor HP minimal 10 digit')
            .max(15, 'Nomor HP terlalu panjang')
            .regex(/^[0-9+\-\s]+$/, 'Format nomor HP tidak valid'),
        password: z.string().min(8, 'Password minimal 8 karakter'),
        confirmPassword: z.string(),
        agreeTerms: z.boolean().refine((value) => value, {
            message: 'Setujui syarat & ketentuan terlebih dahulu',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password tidak cocok',
        path: ['confirmPassword'],
    })

type RegisterFormData = z.infer<typeof registerSchema>

function FieldError({ message }: { message?: string }) {
    if (!message) return null

    return <p className="text-xs font-medium text-red-500">{message}</p>
}

function getPasswordScore(password: string) {
    let score = 0

    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    return score
}

const strengthStyles = [
    { label: 'Lemah', color: 'bg-red-500', text: 'text-red-500' },
    { label: 'Lumayan', color: 'bg-amber-500', text: 'text-amber-500' },
    { label: 'Bagus', color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'Kuat', color: 'bg-[--primary]', text: 'text-[--primary]' },
] as const

export function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            agreeTerms: false,
        },
    })

    const password = watch('password') ?? ''
    const passwordScore = getPasswordScore(password)
    const activeStrength = passwordScore > 0 ? strengthStyles[passwordScore - 1] : null

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        try {
            const result = await signUp({
                email: data.email,
                password: data.password,
                full_name: data.full_name,
                phone: data.phone,
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
            <div className="grid gap-5">
                <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-[13px] font-semibold text-slate-600">
                        Nama Lengkap
                    </Label>
                    <div className="relative">
                        <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="full_name"
                            placeholder="Nama lengkap kamu"
                            aria-invalid={Boolean(errors.full_name)}
                            {...register('full_name')}
                            className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                        />
                    </div>
                    <FieldError message={errors.full_name?.message} />
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
                            aria-invalid={Boolean(errors.email)}
                            {...register('email')}
                            className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                        />
                    </div>
                    <FieldError message={errors.email?.message} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[13px] font-semibold text-slate-600">
                        Nomor HP / WhatsApp
                    </Label>
                    <div className="relative">
                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            aria-invalid={Boolean(errors.phone)}
                            {...register('phone')}
                            className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                        />
                    </div>
                    <FieldError message={errors.phone?.message} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" className="text-[13px] font-semibold text-slate-600">
                        Password
                    </Label>
                    <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 8 karakter"
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

                    {password.length > 0 && (
                        <div className="rounded-2xl border border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 p-4">
                            <div className="mb-2 flex gap-2">
                                {[0, 1, 2, 3].map((index) => (
                                    <span
                                        key={index}
                                        className={`h-1.5 flex-1 rounded-full ${
                                            index < passwordScore ? activeStrength?.color ?? 'bg-slate-200' : 'bg-slate-200'
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className={`text-xs font-semibold ${activeStrength?.text ?? 'text-slate-400'}`}>
                                {activeStrength ? `Kekuatan password: ${activeStrength.label}` : 'Ketik password untuk cek kekuatan'}
                            </p>
                        </div>
                    )}
                    <FieldError message={errors.password?.message} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[13px] font-semibold text-slate-600">
                        Konfirmasi Password
                    </Label>
                    <div className="relative">
                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            id="confirmPassword"
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Ulangi password kamu"
                            aria-invalid={Boolean(errors.confirmPassword)}
                            {...register('confirmPassword')}
                            className="h-[52px] rounded-2xl border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/70 pl-11 pr-12 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[--primary] focus-visible:bg-white focus-visible:ring-[3px] focus-visible:ring-[color:var(--brand-100)]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((value) => !value)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-[--primary]"
                            aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <FieldError message={errors.confirmPassword?.message} />
                </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
                <input
                    type="checkbox"
                    {...register('agreeTerms')}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[--primary] focus:ring-[--primary]"
                />
                <span>
                    Dengan mendaftar, kamu menyetujui syarat, kebijakan privasi, dan alur penggunaan akun siswa.
                </span>
            </label>
            <FieldError message={errors.agreeTerms?.message} />

            <div className="rounded-2xl border border-[color:var(--brand-100)] bg-[linear-gradient(135deg,rgba(255,255,255,0.8),rgba(238,243,255,0.9))] p-4 text-sm text-slate-500">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500" />
                    Data akun akan langsung terhubung ke dashboard siswa.
                </div>
                <p className="mt-1 leading-6">
                    Setelah berhasil mendaftar, akun akan diarahkan ke area belajar untuk melengkapi profil dan mulai ikut kelas.
                </p>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="h-[52px] w-full rounded-2xl bg-[linear-gradient(135deg,_var(--primary),_#3b6eff,_var(--accent))] text-sm font-bold text-white shadow-[0_20px_45px_rgba(26,86,255,0.24)] transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Membuat akun...
                    </>
                ) : (
                    'Buat Akun'
                )}
            </Button>
        </form>
    )
}
