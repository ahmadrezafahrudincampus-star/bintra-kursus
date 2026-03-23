'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, User, Calendar, BookOpen,
    CreditCard, Upload, UserCheck, Bell, Settings,
    LogOut, Menu, X, ChevronRight, History, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/types/database'

const STUDENT_NAV = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/profil', label: 'Profil Saya', icon: User },

    { label: 'Keuangan Pokok', divider: true },
    { href: '/dashboard/iuran', label: 'Tagihan Iuran', icon: CreditCard },
    { href: '/dashboard/kartu-iuran', label: 'Kartu Iuran', icon: CreditCard },
    { href: '/dashboard/upload-kartu', label: 'Upload Bukti Bayar', icon: Upload },

    { label: 'Akademik Pokok', divider: true },
    { href: '/dashboard/absensi', label: 'Riwayat Absensi', icon: UserCheck },

    { label: 'Segera Hadir (Tahap 7)', divider: true },
    { href: '/dashboard/histori-iuran', label: 'Histori Pembayaran', icon: History, badge: 'Stub' },
    { href: '/dashboard/jadwal', label: 'Jadwal Kelas', icon: Calendar, badge: 'Stub' },
    { href: '/dashboard/materi', label: 'Akses Materi', icon: BookOpen, badge: 'Stub' },
    { href: '/dashboard/download-materi', label: 'Download Materi', icon: Download, badge: 'Stub' },
    { href: '/dashboard/pengumuman', label: 'Pengumuman', icon: Bell, badge: 'Stub' },
    { href: '/dashboard/pengaturan', label: 'Pengaturan Akun', icon: Settings, badge: 'Stub' },
]

const APPLICANT_NAV = [
    { href: '/dashboard', label: 'Status Pendaftaran', icon: LayoutDashboard },
    { href: '/daftar', label: 'Isi Formulir', icon: User },

    { label: 'Segera Hadir', divider: true },
    { href: '/dashboard/pengaturan', label: 'Pengaturan Akun', icon: Settings, badge: 'Stub' },
]

export function DashboardSidebar({ profile }: { profile: Pick<Profile, 'id' | 'full_name' | 'role' | 'avatar_url'> }) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const isStudent = profile.role === 'student'
    const nav = isStudent ? STUDENT_NAV : APPLICANT_NAV

    const initials = profile.full_name
        .split(' ')
        .slice(0, 2)
        .map((name) => name[0])
        .join('')
        .toUpperCase()

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-sidebar-foreground" onClick={() => setIsMobileOpen(false)}>
                    <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-white text-sm font-bold">K</div>
                    <div>
                        <span className="block">Kursus Komputer</span>
                        <span className="text-xs text-sidebar-foreground/40 font-normal">Student Portal</span>
                    </div>
                </Link>
            </div>

            <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">{profile.full_name}</p>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sidebar-border text-sidebar-foreground/60 bg-transparent mt-0.5">
                            {profile.role === 'student' ? 'Siswa Aktif' : 'Pendaftar'}
                        </Badge>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {nav.map((item) => {
                    if ('divider' in item && item.divider) {
                        return (
                            <div key={item.label} className="pt-4 pb-1 px-2 first:pt-2">
                                <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider">{item.label}</p>
                            </div>
                        )
                    }
                    if (!('href' in item)) return null

                    const Icon = item.icon!
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-hover group',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                        >
                            <Icon className={cn('w-4 h-4 flex-shrink-0', item.badge && !isActive && 'opacity-50 group-hover:opacity-100')} />
                            <span className={cn('flex-1 truncate', item.badge && !isActive && 'opacity-60 group-hover:opacity-100')}>{item.label}</span>

                            {item.badge && (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-sidebar-border text-sidebar-foreground/60 border-none font-medium">
                                    {item.badge}
                                </Badge>
                            )}

                            {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-3 border-t border-sidebar-border">
                <form action={signOut}>
                    <Button variant="ghost" type="submit" className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 h-9">
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </Button>
                </form>
            </div>
        </div>
    )

    return (
        <>
            <Button
                size="icon"
                variant="ghost"
                className="fixed top-3 left-3 z-50 md:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                id="sidebar-toggle"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 sticky top-0 h-screen overflow-hidden">
                <SidebarContent />
            </aside>

            <aside className={cn(
                'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col md:hidden transform transition-transform duration-300',
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <SidebarContent />
            </aside>
        </>
    )
}
