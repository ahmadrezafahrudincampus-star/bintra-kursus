import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Profil Saya | Dashboard' }

export default async function DashboardProfilPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, role, created_at')
        .eq('id', user.id)
        .returns<{ full_name: string; phone: string | null; role: string; created_at: string }[]>()
        .single()

    return (
        <div className="space-y-6 max-w-xl">
            <div>
                <h1 className="text-2xl font-bold">Profil Saya</h1>
                <p className="text-muted-foreground mt-1">Informasi akun kamu</p>
            </div>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Data Akun
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Nama Lengkap</p>
                            <p className="font-medium">{profile?.full_name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Email</p>
                            <p className="font-medium">{user.email ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Nomor HP</p>
                            <p className="font-medium">{profile?.phone ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Status</p>
                            <p className="font-medium capitalize">{profile?.role ?? '—'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-xs text-muted-foreground mb-1">Terdaftar Sejak</p>
                            <p className="font-medium">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border/40">
                        Untuk mengubah data profil, hubungi admin kursus.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
