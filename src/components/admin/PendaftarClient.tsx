'use client'

import { useMemo, useState } from 'react'
import { ClipboardList, Search, TriangleAlert } from 'lucide-react'
import { ApproveRejectClient, type RegistrationReviewItem, type SessionAssignmentOption } from '@/components/admin/ApproveRejectClient'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export type RegistrationListItem = RegistrationReviewItem & {
    preferred_session_id: string | null
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED'
    rejection_reason: string | null
    created_at: string
    updated_at: string
    assigned_session: {
        id: string
        name: string
        day_of_week: string
        start_time: string
        end_time: string
        current_count: number
        max_capacity: number
    } | null
}

type SessionLookup = Record<string, SessionAssignmentOption[]>

const STATUS_BADGE: Record<
    RegistrationListItem['status'],
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    PENDING: { label: 'Menunggu Review', variant: 'outline' },
    APPROVED: { label: 'Disetujui', variant: 'default' },
    REJECTED: { label: 'Ditolak', variant: 'destructive' },
    DRAFT: { label: 'Draft', variant: 'secondary' },
}

export function PendaftarClient({
    registrations,
    sessionsByCourse,
}: {
    registrations: RegistrationListItem[]
    sessionsByCourse: SessionLookup
}) {
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<'ALL' | RegistrationListItem['status']>('ALL')

    const filteredRegistrations = useMemo(() => {
        return registrations.filter((registration) => {
            const query = searchQuery.trim().toLowerCase()
            const matchesSearch =
                query.length === 0 ||
                registration.full_name.toLowerCase().includes(query) ||
                (registration.reg_number ?? '').toLowerCase().includes(query) ||
                registration.phone.toLowerCase().includes(query) ||
                (registration.course_master?.name ?? '').toLowerCase().includes(query)

            const matchesStatus =
                statusFilter === 'ALL' || registration.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [registrations, searchQuery, statusFilter])

    const pendingRegistrations = filteredRegistrations.filter(
        (registration) => registration.status === 'PENDING'
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari nama pendaftar, no registrasi, nomor HP, atau program..."
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DRAFT'] as const).map((status) => (
                            <Button
                                key={status}
                                type="button"
                                variant={statusFilter === status ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === 'ALL' ? 'Semua Status' : STATUS_BADGE[status].label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {pendingRegistrations.length > 0 ? (
                <Card className="border-yellow-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-yellow-700">
                            <TriangleAlert className="h-4 w-4" />
                            Menunggu Review ({pendingRegistrations.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingRegistrations.map((registration) => (
                            <ApproveRejectClient
                                key={registration.id}
                                registration={registration}
                                availableSessions={
                                    registration.course_master?.id
                                        ? sessionsByCourse[registration.course_master.id] ?? []
                                        : []
                                }
                            />
                        ))}
                    </CardContent>
                </Card>
            ) : null}

            <Card>
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle>Semua Pendaftaran</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                    {filteredRegistrations.length > 0 ? (
                        <div className="space-y-3">
                            {filteredRegistrations.map((registration) => {
                                const badge = STATUS_BADGE[registration.status]
                                const sessionsForCourse = registration.course_master?.id
                                    ? sessionsByCourse[registration.course_master.id] ?? []
                                    : []
                                const availableSessions = sessionsForCourse.filter(
                                    (session) => session.current_count < session.max_capacity
                                ).length

                                return (
                                    <div
                                        key={registration.id}
                                        className="rounded-2xl border border-border/60 bg-card p-4"
                                    >
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">{registration.full_name}</p>
                                                    <Badge variant={badge.variant}>{badge.label}</Badge>
                                                    <Badge variant="outline">
                                                        {registration.participant_category}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {registration.course_master?.name ?? '-'} ·{' '}
                                                    {registration.reg_number ?? 'No. registrasi belum ada'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Daftar pada{' '}
                                                    {new Date(registration.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 lg:min-w-[320px]">
                                                <div>
                                                    <p className="text-xs">No. HP</p>
                                                    <p className="font-medium text-foreground">
                                                        {registration.phone}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs">Sekolah</p>
                                                    <p className="font-medium text-foreground">
                                                        {registration.school_name || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs">Sesi Tersedia</p>
                                                    <p className="font-medium text-foreground">
                                                        {availableSessions} dari {sessionsForCourse.length}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs">Sesi Saat Ini</p>
                                                    <p className="font-medium text-foreground">
                                                        {registration.assigned_session?.name ?? '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {registration.status === 'REJECTED' && registration.rejection_reason ? (
                                            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                Alasan penolakan: {registration.rejection_reason}
                                            </div>
                                        ) : null}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-muted-foreground">
                            <ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-20" />
                            <p className="font-medium">Tidak ada pendaftaran yang cocok dengan filter.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
