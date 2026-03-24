import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Lock, Settings, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Pengaturan Akun' }

export default async function DashboardPengaturanPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, role')
        .eq('id', user.id)
        .returns<{ full_name: string; phone: string | null; role: string }[]>()
        .single()

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Pengaturan Akun</h1>
                <p className="mt-1 text-muted-foreground">
                    Kelola informasi dasar akun dan akses Anda di sistem kursus.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <UserCircle className="h-5 w-5 text-primary" />
                            Informasi Akun
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-5 text-sm">
                        <div>
                            <p className="text-xs text-muted-foreground">Nama</p>
                            <p className="font-medium">{profile?.full_name ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{user.email ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Nomor HP</p>
                            <p className="font-medium">{profile?.phone ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Peran</p>
                            <p className="font-medium capitalize">{profile?.role ?? '-'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-border/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Lock className="h-5 w-5 text-primary" />
                            Keamanan & Bantuan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-5 text-sm">
                        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                            <p className="font-medium">Perlu ubah data akun?</p>
                            <p className="mt-1 text-muted-foreground">
                                Untuk perubahan profil, nomor HP, atau bantuan reset password, hubungi admin kursus.
                            </p>
                        </div>
                        <form action={signOut}>
                            <Button type="submit" variant="outline" className="w-full">
                                Keluar dari Akun
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
                    <Settings className="h-5 w-5 text-primary" />
                    Beberapa pengaturan lanjutan akan ditambahkan bertahap sesuai kebutuhan operasional kursus.
                </CardContent>
            </Card>
        </div>
    )
}
