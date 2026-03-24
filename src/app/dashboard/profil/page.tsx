import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Profil Saya | Dashboard' }

export default async function DashboardProfilPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, role, created_at')
        .eq('id', user.id)
        .returns<{ full_name: string; phone: string | null; role: string; created_at: string }[]>()
        .single()

    return (
        <div className="max-w-xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Profil Saya</h1>
                <p className="mt-1 text-muted-foreground">Informasi akun Anda di sistem kursus.</p>
            </div>
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <User className="h-4 w-4" />
                        Data Akun
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">Nama Lengkap</p>
                            <p className="font-medium">{profile?.full_name ?? '-'}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email ?? '-'}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">Nomor HP</p>
                            <p className="font-medium">{profile?.phone ?? '-'}</p>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-muted-foreground">Status</p>
                            <p className="font-medium capitalize">{profile?.role ?? '-'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="mb-1 text-xs text-muted-foreground">Terdaftar Sejak</p>
                            <p className="font-medium">
                                {profile?.created_at
                                    ? new Date(profile.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : '-'}
                            </p>
                        </div>
                    </div>
                    <p className="border-t border-border/40 pt-2 text-xs text-muted-foreground">
                        Untuk mengubah data profil, hubungi admin kursus.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
