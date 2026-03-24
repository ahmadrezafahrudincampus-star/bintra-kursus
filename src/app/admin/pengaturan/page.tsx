import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingContentAdminClient } from '@/components/admin/LandingContentAdminClient'
import { CheckCircle2, Database, Globe, KeyRound, Settings, Shield } from 'lucide-react'
import type { Metadata } from 'next'
import { getLandingContent, getLandingMediaAssets } from '@/lib/actions/landing-content'

export const metadata: Metadata = { title: 'Pengaturan Admin' }

export default async function AdminPengaturanPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const [landingContent, landingMediaAssets] = await Promise.all([
        getLandingContent(),
        getLandingMediaAssets(),
    ])

    const [{ count: totalCourses }, { count: totalSessions }, { count: totalStudents }, { data: profile }] = await Promise.all([
        supabase.from('course_master').select('id', { count: 'exact', head: true }),
        supabase.from('sessions').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('profiles').select('full_name, role').eq('id', user?.id ?? '').returns<{ full_name: string; role: string }[]>().single(),
    ])

    const integrations = [
        {
            label: 'Supabase URL',
            ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            hint: 'Koneksi project utama',
            icon: Globe,
        },
        {
            label: 'Supabase Anon Key',
            ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            hint: 'Dipakai untuk auth dan query client',
            icon: KeyRound,
        },
        {
            label: 'Service Role Key',
            ok: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SERVICE_ROLE_KEY_HERE',
            hint: 'Diperlukan untuk seed admin dan operasi server tertentu',
            icon: Shield,
        },
    ]

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold">Pengaturan</h1>
                <p className="text-muted-foreground mt-1">
                    Halaman ini merangkum status integrasi, identitas admin aktif, dan kesehatan dasar sistem.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Admin Aktif
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Nama</p>
                            <p className="text-lg font-semibold mt-1">{profile?.full_name ?? 'Super Admin'}</p>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
                            <div className="mt-2">
                                <Badge>{profile?.role ?? 'super_admin'}</Badge>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Akun Login</p>
                            <p className="text-sm font-medium mt-1 break-all">{user?.email ?? 'Tidak tersedia'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-primary" />
                            Integrasi Sistem
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-3">
                        {integrations.map((item) => {
                            const Icon = item.icon
                            return (
                                <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4">
                                    <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${item.ok ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-medium">{item.label}</p>
                                            <Badge variant={item.ok ? 'outline' : 'secondary'}>
                                                {item.ok ? 'Aktif' : 'Perlu dicek'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{item.hint}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Program Kursus', value: totalCourses ?? 0 },
                    { label: 'Sesi Kelas', value: totalSessions ?? 0 },
                    { label: 'Siswa Aktif', value: totalStudents ?? 0 },
                ].map((item) => (
                    <Card key={item.label}>
                        <CardContent className="p-5">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                            <p className="text-2xl font-bold mt-1">{item.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        Checklist Operasional
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <div className="space-y-3 text-sm">
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            Pastikan migration Supabase terbaru sudah dijalankan, termasuk bucket `course-materials`.
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            Gunakan halaman `Kelola User`, `Sesi Kelas`, dan `Log Aktivitas` untuk audit operasional harian.
                        </div>
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                            Jika seed admin belum jalan, isi `SUPABASE_SERVICE_ROLE_KEY` lalu gunakan script `npm run seed:super-admin`.
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        CMS Landing Page
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <LandingContentAdminClient
                        initialContent={landingContent}
                        initialMediaAssets={landingMediaAssets}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
