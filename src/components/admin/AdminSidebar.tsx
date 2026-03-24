'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard, Users, UserPlus, GraduationCap, Calendar,
    BookOpen, CreditCard, ClipboardList, Megaphone,
    Settings, LogOut, Menu, X, ChevronRight, FileText,
    ScrollText, DollarSign, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Profile } from '@/types/database'

const ADMIN_NAV = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },

    { label: 'Akademik', divider: true },
    { href: '/admin/jadwal', label: 'Jadwal Kelas', icon: Calendar },
    { href: '/admin/pendaftar', label: 'Kelola Pendaftar', icon: UserPlus },
    { href: '/admin/siswa', label: 'Kelola Siswa', icon: GraduationCap },
    { href: '/admin/absensi', label: 'Input Absensi', icon: ClipboardList },
    { href: '/admin/absensi/rekap', label: 'Rekap Absensi', icon: ScrollText },
    { href: '/admin/template-absen', label: 'Template Absen', icon: FileText },
    { href: '/admin/materi', label: 'Konten Materi', icon: BookOpen },

    { label: 'Keuangan & Laporan', divider: true },
    { href: '/admin/keuangan', label: 'Keuangan & Verifikasi', icon: DollarSign },
    { href: '/admin/kartu-iuran', label: 'Kartu Iuran', icon: CreditCard },
    { href: '/admin/export', label: 'Export Data', icon: FileText },

    { label: 'Konten Pokok', divider: true },
    { href: '/admin/pengumuman', label: 'Pengumuman', icon: Megaphone },
    { label: 'Administrasi', divider: true },
    { href: '/admin/sesi', label: 'Sesi Kelas', icon: Calendar },
    { href: '/admin/user', label: 'Kelola User', icon: Users },
    { href: '/admin/logs', label: 'Log Aktivitas', icon: Shield },
    { href: '/admin/pengaturan', label: 'Pengaturan', icon: Settings },
]

function AdminSidebarContent({
    initials,
    fullName,
    pathname,
    onNavigate,
}: {
    initials: string
    fullName: string
    pathname: string
    onNavigate: () => void
}) {
    return (
        <div className="flex flex-col h-full">
            <div className="p-5 border-b border-sidebar-border">
                <Link href="/" className="flex items-center gap-2.5 font-bold text-sidebar-foreground" onClick={onNavigate}>
                    <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center text-white text-sm font-bold">K</div>
                    <div>
                        <span className="block">Kursus Komputer</span>
                        <span className="text-xs text-sidebar-foreground/40 font-normal">Admin Panel</span>
                    </div>
                </Link>
            </div>

            <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-sidebar-primary text-white text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">{fullName}</p>
                        <p className="text-xs text-sidebar-foreground/50 truncate">Super Admin</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
                {ADMIN_NAV.map((item) => {
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
                            onClick={onNavigate}
                            className={cn(
                                'flex items-center gap-3 px-3 h-10 rounded-lg text-sm transition-hover group',
                                isActive
                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1 truncate">{item.label}</span>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
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
}

export function AdminSidebar({ profile }: { profile: Pick<Profile, 'full_name' | 'role'> }) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const initials = profile.full_name
        .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

    return (
        <>
            <Button size="icon" variant="ghost" className="fixed top-3 left-3 z-50 md:hidden" onClick={() => setIsMobileOpen(!isMobileOpen)}>
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {isMobileOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)} />}

            <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 sticky top-0 h-screen overflow-hidden">
                <AdminSidebarContent
                    initials={initials}
                    fullName={profile.full_name}
                    pathname={pathname}
                    onNavigate={() => setIsMobileOpen(false)}
                />
            </aside>

            <aside className={cn(
                'fixed inset-y-0 left-0 z-50 w-72 bg-sidebar flex flex-col md:hidden transform transition-transform duration-300',
                isMobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}>
                <AdminSidebarContent
                    initials={initials}
                    fullName={profile.full_name}
                    pathname={pathname}
                    onNavigate={() => setIsMobileOpen(false)}
                />
            </aside>
        </>
    )
}
