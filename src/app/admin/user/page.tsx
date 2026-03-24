import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Phone, Shield, UserPlus, Users } from 'lucide-react'
import type { Metadata } from 'next'
import type { Profile } from '@/types/database'
import { UserAdminClient, type UserListItem } from '@/components/admin/UserAdminClient'

export const metadata: Metadata = { title: 'Kelola User' }

type ProfileWithRelations = Pick<Profile, 'id' | 'full_name' | 'phone' | 'role' | 'created_at'> & {
    registrations: { id: string }[] | null
    student_enrollments: { id: string; status: string }[] | null
}

const ROLE_LABELS: Record<Profile['role'], string> = {
    super_admin: 'Super Admin',
    applicant: 'Pendaftar',
    student: 'Siswa',
}

const ROLE_BADGE: Record<Profile['role'], 'default' | 'secondary' | 'outline'> = {
    super_admin: 'default',
    applicant: 'secondary',
    student: 'outline',
}

export default async function AdminUserPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profiles } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            phone,
            role,
            created_at,
            registrations(id),
            student_enrollments(id, status)
        `)
        .order('created_at', { ascending: false })
        .returns<ProfileWithRelations[]>()

    const profileList = profiles ?? []
    const users: UserListItem[] = profileList.map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        created_at: profile.created_at,
        registration_count: profile.registrations?.length ?? 0,
        active_enrollments: profile.student_enrollments?.filter((item) => item.status === 'ACTIVE').length ?? 0,
    }))

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-2xl font-bold">Kelola User</h1>
                <p className="text-muted-foreground mt-1">
                    Lihat seluruh profil pengguna yang sudah terdaftar di sistem beserta status perannya.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                    { label: 'Total User', value: profileList.length, icon: Users },
                    { label: 'Super Admin', value: profileList.filter((profile) => profile.role === 'super_admin').length, icon: Shield },
                    { label: 'Pendaftar', value: profileList.filter((profile) => profile.role === 'applicant').length, icon: UserPlus },
                    { label: 'Siswa', value: profileList.filter((profile) => profile.role === 'student').length, icon: Users },
                ].map((item) => {
                    const Icon = item.icon
                    return (
                        <Card key={item.label}>
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                                        <p className="text-2xl font-bold mt-1">{item.value}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle>Daftar Pengguna</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    <UserAdminClient users={users} />
                </CardContent>
            </Card>
        </div>
    )
}
