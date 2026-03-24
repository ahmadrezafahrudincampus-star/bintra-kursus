'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Loader2, TriangleAlert, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { approveRegistration, rejectRegistration } from '@/lib/actions/registration'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export interface RegistrationReviewItem {
    id: string
    full_name: string
    reg_number: string | null
    gender: 'L' | 'P'
    phone: string
    email: string | null
    address: string
    school_name: string
    participant_category: 'SMP' | 'SMA' | 'Umum'
    class_name: string | null
    parent_name: string | null
    parent_phone: string | null
    experience: string | null
    goals: string | null
    course_master: { id: string; name: string } | null
}

export interface SessionAssignmentOption {
    id: string
    name: string
    day_of_week: string
    start_time: string
    end_time: string
    current_count: number
    max_capacity: number
}

export function ApproveRejectClient({
    registration,
    availableSessions,
}: {
    registration: RegistrationReviewItem
    availableSessions: SessionAssignmentOption[]
}) {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedSession, setSelectedSession] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isPending, startTransition] = useTransition()

    const sortedSessions = useMemo(
        () =>
            [...availableSessions].sort((a, b) => {
                if (a.day_of_week !== b.day_of_week) return a.day_of_week.localeCompare(b.day_of_week)
                return a.start_time.localeCompare(b.start_time)
            }),
        [availableSessions]
    )

    const selectedSessionData =
        sortedSessions.find((session) => session.id === selectedSession) ?? null
    const availableCount = sortedSessions.filter(
        (session) => session.current_count < session.max_capacity
    ).length
    const hasSession = sortedSessions.length > 0
    const hasAvailableSession = availableCount > 0
    const selectedSessionFull =
        selectedSessionData !== null &&
        selectedSessionData.current_count >= selectedSessionData.max_capacity

    const resetApproveDialog = () => {
        setShowApproveDialog(false)
        setSelectedSession('')
    }

    const resetRejectDialog = () => {
        setShowRejectDialog(false)
        setRejectReason('')
    }

    const handleApprove = () => {
        if (!selectedSession) {
            toast.error('Pilih sesi kelas terlebih dahulu.')
            return
        }

        if (selectedSessionFull) {
            toast.error('Sesi yang dipilih sudah penuh. Pilih sesi lain atau buat sesi baru.')
            return
        }

        startTransition(async () => {
            const result = await approveRegistration(registration.id, selectedSession)

            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success(`${registration.full_name} berhasil disetujui dan dimasukkan ke sesi.`)
            resetApproveDialog()
            router.refresh()
        })
    }

    const handleReject = () => {
        const trimmedReason = rejectReason.trim()
        if (!trimmedReason) {
            toast.error('Alasan penolakan wajib diisi.')
            return
        }

        startTransition(async () => {
            const result = await rejectRegistration(registration.id, trimmedReason)

            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success('Pendaftaran berhasil ditolak.')
            resetRejectDialog()
            router.refresh()
        })
    }

    return (
        <div className="overflow-hidden rounded-xl border border-border/60">
            <div
                className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/30"
                onClick={() => setIsExpanded((current) => !current)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700">
                        {registration.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{registration.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                            {registration.course_master?.name ?? '-'} · {registration.participant_category} ·{' '}
                            {registration.school_name || 'Sekolah belum diisi'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 sm:flex">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-600 hover:bg-green-50"
                            onClick={(event) => {
                                event.stopPropagation()
                                setShowApproveDialog(true)
                            }}
                        >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Setujui
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={(event) => {
                                event.stopPropagation()
                                setShowRejectDialog(true)
                            }}
                        >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Tolak
                        </Button>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </div>

            {isExpanded ? (
                <div className="border-t border-border/60 bg-muted/20 p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                        {[
                            {
                                label: 'Jenis Kelamin',
                                value: registration.gender === 'L' ? 'Laki-laki' : 'Perempuan',
                            },
                            { label: 'No. HP', value: registration.phone },
                            { label: 'Email', value: registration.email ?? '-' },
                            { label: 'Sekolah', value: registration.school_name || '-' },
                            { label: 'Kelas', value: registration.class_name ?? '-' },
                            { label: 'Orang Tua', value: registration.parent_name ?? '-' },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {registration.address ? (
                        <div className="mt-3 text-sm">
                            <p className="text-xs text-muted-foreground">Alamat</p>
                            <p>{registration.address}</p>
                        </div>
                    ) : null}

                    {registration.experience ? (
                        <div className="mt-3 text-sm">
                            <p className="text-xs text-muted-foreground">Pengalaman</p>
                            <p>{registration.experience}</p>
                        </div>
                    ) : null}

                    {registration.goals ? (
                        <div className="mt-3 text-sm">
                            <p className="text-xs text-muted-foreground">Tujuan Kursus</p>
                            <p>{registration.goals}</p>
                        </div>
                    ) : null}

                    <div className="mt-4 flex gap-2 sm:hidden">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                            onClick={() => setShowApproveDialog(true)}
                        >
                            <CheckCircle className="mr-1 h-3.5 w-3.5" />
                            Setujui
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setShowRejectDialog(true)}
                        >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Tolak
                        </Button>
                    </div>
                </div>
            ) : null}

            <Dialog
                open={showApproveDialog}
                onOpenChange={(open) => (open ? setShowApproveDialog(true) : resetApproveDialog())}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Pendaftaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Menyetujui <strong>{registration.full_name}</strong> ke program{' '}
                            <strong>{registration.course_master?.name ?? '-'}</strong>. Pilih sesi kelas yang masih tersedia.
                        </p>

                        <div className="space-y-2">
                            <Label>Sesi Kelas</Label>
                            {!hasSession ? (
                                <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                                    <div className="flex items-start gap-2">
                                        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p>Belum ada sesi aktif untuk program ini. Buat sesi baru sebelum menyetujui pendaftar.</p>
                                    </div>
                                    <Button asChild size="sm" variant="outline">
                                        <Link href="/admin/jadwal">Buka Kelola Jadwal</Link>
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Select value={selectedSession} onValueChange={(value) => setSelectedSession(value ?? '')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih sesi kelas" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortedSessions.map((session) => {
                                                const isFull = session.current_count >= session.max_capacity
                                                return (
                                                    <SelectItem key={session.id} value={session.id} disabled={isFull}>
                                                        {session.name} - {session.day_of_week} {session.start_time.slice(0, 5)}-{session.end_time.slice(0, 5)} ({session.current_count}/{session.max_capacity})
                                                        {isFull ? ' [PENUH]' : ''}
                                                    </SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>

                                    <p className="text-xs text-muted-foreground">
                                        {availableCount}/{sortedSessions.length} sesi masih punya slot.
                                    </p>
                                </>
                            )}
                        </div>

                        {hasSession && !hasAvailableSession ? (
                            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                                Semua sesi untuk program ini sedang penuh. Disarankan buat sesi baru dengan hari atau jam berbeda.
                            </div>
                        ) : null}

                        {selectedSessionData ? (
                            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                                <p className="font-medium">{selectedSessionData.name}</p>
                                <p className="text-muted-foreground">
                                    {selectedSessionData.day_of_week} {selectedSessionData.start_time.slice(0, 5)}-{selectedSessionData.end_time.slice(0, 5)}
                                </p>
                                <p className="mt-1">
                                    Kapasitas saat ini: {selectedSessionData.current_count}/{selectedSessionData.max_capacity}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetApproveDialog}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApprove}
                            disabled={isPending || !selectedSession || selectedSessionFull}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Setujui & Assign'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showRejectDialog}
                onOpenChange={(open) => (open ? setShowRejectDialog(true) : resetRejectDialog())}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Pendaftaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Menolak pendaftaran <strong>{registration.full_name}</strong>. Tulis alasan agar admin lain dan siswa memahami keputusan ini.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Alasan Penolakan</Label>
                            <Textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(event) => setRejectReason(event.target.value)}
                                placeholder="Contoh: kuota sesi penuh, data belum lengkap, atau dokumen belum valid."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetRejectDialog}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isPending || rejectReason.trim().length < 10}
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tolak Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
