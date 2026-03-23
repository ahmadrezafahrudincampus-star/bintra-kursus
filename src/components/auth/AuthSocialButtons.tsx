'use client'

import { toast } from 'sonner'

type AuthSocialButtonsProps = {
    mode: 'login' | 'register'
}

export function AuthSocialButtons({ mode }: AuthSocialButtonsProps) {
    const actionLabel = mode === 'login' ? 'masuk' : 'daftar'

    const handleComingSoon = (provider: string) => {
        toast(`${provider} untuk ${actionLabel} belum tersedia.`)
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            <button
                type="button"
                onClick={() => handleComingSoon('Google')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-[--primary]/30 hover:bg-[color:var(--brand-50)] hover:text-[--primary]"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.96 5.96 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09A6.63 6.63 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84Z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                        fill="#EA4335"
                    />
                </svg>
                Google
            </button>

            <button
                type="button"
                onClick={() => handleComingSoon('Facebook')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-[--primary]/30 hover:bg-[color:var(--brand-50)] hover:text-[--primary]"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M24 12.07C24 5.45 18.63.07 12 .07S0 5.45 0 12.07c0 5.99 4.39 10.95 10.13 11.85v-8.39H7.08v-3.47h3.05V9.43c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87v2.25h3.33l-.53 3.47h-2.8v8.39C19.61 23.03 24 18.06 24 12.07Z"
                        fill="#1877F2"
                    />
                </svg>
                Facebook
            </button>
        </div>
    )
}
