'use client'

import { useMemo, useState } from 'react'
import { Phone, Search, Shield, UserPlus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Profile } from '@/types/database'

export type UserListItem = {
    id: string
    full_name: string
    phone: string | null
    role: Profile['role']
    created_at: string
    registration_count: number
    active_enrollments: number
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

export function UserAdminClient({ users }: { users: UserListItem[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<'all' | Profile['role']>('all')

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const query = searchQuery.trim().toLowerCase()
            const matchesSearch =
                query.length === 0 ||
                user.full_name.toLowerCase().includes(query) ||
                (user.phone ?? '').toLowerCase().includes(query)

            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            return matchesSearch && matchesRole
        })
    }, [roleFilter, searchQuery, users])

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari nama pengguna atau nomor HP..."
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {([
                            ['all', 'Semua Role'],
                            ['super_admin', 'Super Admin'],
                            ['applicant', 'Pendaftar'],
                            ['student', 'Siswa'],
                        ] as const).map(([value, label]) => (
                            <Button
                                key={value}
                                type="button"
                                size="sm"
                                variant={roleFilter === value ? 'default' : 'outline'}
                                onClick={() => setRoleFilter(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {filteredUsers.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Users className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Tidak ada user yang cocok dengan filter.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="rounded-2xl border border-border/60 bg-card p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold">{user.full_name}</h2>
                                        <Badge variant={ROLE_BADGE[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Phone className="h-3.5 w-3.5" />
                                            {user.phone || 'Nomor HP belum diisi'}
                                        </span>
                                        <span>
                                            Bergabung {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid min-w-[250px] grid-cols-3 gap-2">
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">Form</p>
                                        <p className="mt-1 text-lg font-semibold">{user.registration_count}</p>
                                    </div>
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">Kelas Aktif</p>
                                        <p className="mt-1 text-lg font-semibold">{user.active_enrollments}</p>
                                    </div>
                                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                                        <p className="text-xs text-muted-foreground">Role</p>
                                        <p className="mt-1 text-sm font-semibold">
                                            {user.role === 'super_admin' ? <Shield className="h-4 w-4" /> : user.role === 'applicant' ? <UserPlus className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
