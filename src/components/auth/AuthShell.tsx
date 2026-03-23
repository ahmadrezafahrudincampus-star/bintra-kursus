import Link from 'next/link'
import { DM_Sans, Syne } from 'next/font/google'
import { ArrowLeft, LaptopMinimal, Sparkles, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-auth-body',
})

const syne = Syne({
    subsets: ['latin'],
    variable: '--font-auth-heading',
})

const authContent = {
    login: {
        emoji: 'HI',
        titleTop: 'Selamat Datang',
        titleAccent: 'Kembali!',
        description:
            'Lanjutkan perjalanan belajarmu. Masuk ke akun dan akses jadwal, materi, dan progres kursusmu dalam satu tempat.',
    },
    register: {
        emoji: 'GO',
        titleTop: 'Mulai Perjalanan',
        titleAccent: 'Digitalmu!',
        description:
            'Gabung bersama ratusan siswa yang sedang membangun skill komputer, office, desain, dan teknologi praktis untuk karier.',
    },
} as const

type AuthShellProps = {
    mode: 'login' | 'register'
    title: string
    subtitle: React.ReactNode
    children: React.ReactNode
}

export function AuthShell({ mode, title, subtitle, children }: AuthShellProps) {
    const content = authContent[mode]

    return (
        <main
            className={cn(
                dmSans.variable,
                syne.variable,
                'min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,110,255,0.16),_transparent_34%),linear-gradient(180deg,_#f4f7ff_0%,_#edf3ff_55%,_#e8f0ff_100%)] font-[family:var(--font-auth-body)] text-slate-900'
            )}
        >
            <nav className="fixed inset-x-0 top-0 z-30 border-b border-white/50 bg-white/70 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3 text-sm font-bold text-[--primary]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_var(--primary),_var(--accent))] text-white shadow-[0_12px_30px_rgba(26,86,255,0.28)]">
                            <LaptopMinimal className="h-5 w-5" />
                        </span>
                        <span>Kursus Komputer</span>
                    </Link>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-[--primary]/30 hover:text-[--primary]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
                <section className="relative hidden overflow-hidden lg:flex">
                    <div className="absolute inset-0 bg-[linear-gradient(145deg,#1040cc_0%,#1a56ff_48%,#0aacff_100%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.13)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-60" />
                    <div className="absolute -right-16 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute -bottom-12 -left-16 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
                    <div className="absolute left-[12%] top-[22%] h-3.5 w-3.5 rounded-full bg-white/35" />
                    <div className="absolute right-[16%] top-[38%] h-2.5 w-2.5 rounded-full bg-white/45" />
                    <div className="absolute bottom-[28%] right-[20%] h-2 w-2 rounded-full bg-white/40" />

                    <div className="relative z-10 flex w-full flex-col justify-center px-10 py-24 xl:px-16">
                        <div className="max-w-xl">
                            <div className="mb-6 inline-flex h-[72px] w-[72px] items-center justify-center rounded-[28px] border border-white/20 bg-white/10 text-xl font-extrabold tracking-[0.16em] text-white shadow-[0_18px_55px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                                {content.emoji}
                            </div>

                            <h1 className="font-[family:var(--font-auth-heading)] text-5xl leading-[1.02] font-extrabold tracking-tight text-white xl:text-6xl">
                                {content.titleTop}
                                <br />
                                <span className="text-white/75">{content.titleAccent}</span>
                            </h1>

                            <p className="mt-6 max-w-lg text-lg leading-8 text-white/78">
                                {content.description}
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                {[
                                    ['500+', 'Siswa Aktif'],
                                    ['11', 'Program Kursus'],
                                    ['4.9', 'Rating Kelas'],
                                ].map(([value, label]) => (
                                    <div
                                        key={label}
                                        className="min-w-32 rounded-2xl border border-white/20 bg-white/12 px-5 py-4 text-white backdrop-blur-md"
                                    >
                                        <div className="font-[family:var(--font-auth-heading)] text-2xl font-extrabold">
                                            {value}
                                        </div>
                                        <div className="mt-1 text-sm text-white/78">{label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/12 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
                                <div className="flex -space-x-2">
                                    {['A', 'B', 'C'].map((item, index) => (
                                        <span
                                            key={item}
                                            className={cn(
                                                'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 text-[11px] font-bold text-white',
                                                index === 0 && 'bg-sky-400',
                                                index === 1 && 'bg-violet-400',
                                                index === 2 && 'bg-emerald-400'
                                            )}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                Dipercaya ratusan pelajar di kota Anda
                            </div>

                            <div className="mt-10 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/75">
                                        <Sparkles className="h-4 w-4" />
                                        Belajar lebih terarah
                                    </div>
                                    <p className="text-sm leading-6 text-white/85">
                                        Jadwal, materi, dan progres akun siswa tersusun rapi dari awal.
                                    </p>
                                </div>
                                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md">
                                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/75">
                                        <Star className="h-4 w-4 fill-current" />
                                        Pengalaman lebih meyakinkan
                                    </div>
                                    <p className="text-sm leading-6 text-white/85">
                                        Tampilan auth dibuat lebih modern supaya kesan pertama platform lebih kuat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative flex min-h-screen items-center justify-center px-4 pb-10 pt-28 sm:px-6 lg:px-10">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.9))]" />
                    <div className="relative z-10 w-full max-w-xl">
                        <div className="mx-auto w-full max-w-[28rem] rounded-[32px] border border-white/65 bg-white/88 p-4 shadow-[0_24px_80px_rgba(26,86,255,0.15)] backdrop-blur-xl sm:p-6">
                            <div className="mb-8 rounded-2xl border border-[color:var(--brand-100)] bg-[color:var(--brand-50)]/80 p-1">
                                <div className="grid grid-cols-2 gap-1">
                                    <Link
                                        href="/login"
                                        className={cn(
                                            'rounded-[14px] px-4 py-3 text-center text-sm font-semibold transition-all duration-200',
                                            mode === 'login'
                                                ? 'bg-white text-[--primary] shadow-[0_8px_24px_rgba(26,86,255,0.12)]'
                                                : 'text-slate-500 hover:text-[--primary]'
                                        )}
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className={cn(
                                            'rounded-[14px] px-4 py-3 text-center text-sm font-semibold transition-all duration-200',
                                            mode === 'register'
                                                ? 'bg-white text-[--primary] shadow-[0_8px_24px_rgba(26,86,255,0.12)]'
                                                : 'text-slate-500 hover:text-[--primary]'
                                        )}
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            </div>

                            <div className="mb-7">
                                <h2 className="font-[family:var(--font-auth-heading)] text-3xl font-extrabold tracking-tight text-slate-900">
                                    {title}
                                </h2>
                                <div className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</div>
                            </div>

                            {children}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
