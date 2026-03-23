'use client'

import { useState } from 'react'
import { approveRegistration, rejectRegistration } from '@/lib/actions/registration'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'

interface Registration {
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
    sessions: { id: string; name: string; day_of_week: string; start_time: string; end_time: string } | null
}

interface Session {
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
    registration: Registration
    availableSessions: Session[]
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [showApproveDialog, setShowApproveDialog] = useState(false)
    const [showRejectDialog, setShowRejectDialog] = useState(false)
    const [selectedSession, setSelectedSession] = useState('')
    const [rejectReason, setRejectReason] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleApprove = async () => {
        if (!selectedSession) {
            toast.error('Pilih sesi kelas terlebih dahulu')
            return
        }
        setIsLoading(true)
        const result = await approveRegistration(registration.id, selectedSession)
        setIsLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(`${registration.full_name} berhasil disetujui dan dijadwalkan ke kelas.`)
            setShowApproveDialog(false)
        }
    }

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Alasan penolakan wajib diisi')
            return
        }
        setIsLoading(true)
        const result = await rejectRegistration(registration.id, rejectReason)
        setIsLoading(false)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('Pendaftaran ditolak.')
            setShowRejectDialog(false)
        }
    }

    return (
        <div className="border border-border/60 rounded-xl overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">
                        {registration.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-sm">{registration.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                            {registration.course_master?.name ?? '—'} · {registration.participant_category} · {registration.school_name}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={(e) => { e.stopPropagation(); setShowApproveDialog(true) }}
                        >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Setujui
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); setShowRejectDialog(true) }}
                        >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                        </Button>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
            </div>

            {/* Details */}
            {isExpanded && (
                <div className="border-t border-border/60 p-4 bg-muted/20">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        {[
                            { label: 'Jenis Kelamin', value: registration.gender === 'L' ? 'Laki-laki' : 'Perempuan' },
                            { label: 'No. HP', value: registration.phone },
                            { label: 'Email', value: registration.email ?? '-' },
                            { label: 'Sekolah', value: registration.school_name },
                            { label: 'Kelas', value: registration.class_name ?? '-' },
                            { label: 'Orang Tua', value: registration.parent_name ?? '-' },
                        ].map((item) => (
                            <div key={item.label}>
                                <p className="text-xs text-muted-foreground">{item.label}</p>
                                <p className="font-medium">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    {registration.address && (
                        <div className="mt-3 text-sm">
                            <p className="text-xs text-muted-foreground">Alamat</p>
                            <p>{registration.address}</p>
                        </div>
                    )}
                    {registration.goals && (
                        <div className="mt-3 text-sm">
                            <p className="text-xs text-muted-foreground">Tujuan Kursus</p>
                            <p>{registration.goals}</p>
                        </div>
                    )}

                    {/* Mobile Actions */}
                    <div className="sm:hidden flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 text-green-600 border-green-200 hover:bg-green-50" variant="outline" onClick={() => setShowApproveDialog(true)}>
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Setujui
                        </Button>
                        <Button size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" variant="outline" onClick={() => setShowRejectDialog(true)}>
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                        </Button>
                    </div>
                </div>
            )}

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Setujui Pendaftaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Menyetujui <strong>{registration.full_name}</strong> ke program{' '}
                            <strong>{registration.course_master?.name}</strong>. Pilih sesi kelas:
                        </p>
                        <div className="space-y-2">
                            <Label>Sesi Kelas *</Label>
                            {availableSessions.length === 0 ? (
                                <p className="text-sm text-orange-600 border border-orange-200 bg-orange-50 rounded-lg p-3">
                                    Tidak ada sesi tersedia untuk program ini. Tambah sesi di menu Kelola Sesi terlebih dahulu.
                                </p>
                            ) : (
                                <Select onValueChange={(val: string | null) => setSelectedSession(val ?? '')}>
                                    <SelectTrigger><SelectValue placeholder="Pilih sesi kelas" /></SelectTrigger>
                                    <SelectContent>
                                        {availableSessions.map((s) => (
                                            <SelectItem key={s.id} value={s.id} disabled={s.current_count >= s.max_capacity}>
                                                {s.name} — {s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                                                {' '}({s.current_count}/{s.max_capacity})
                                                {s.current_count >= s.max_capacity && ' [PENUH]'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            ℹ Setelah disetujui: akun siswa diaktifkan, siswa masuk ke sesi yang dipilih, dan invoice iuran pertama dibuat otomatis.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>Batal</Button>
                        <Button onClick={handleApprove} disabled={isLoading || !selectedSession} className="bg-green-600 hover:bg-green-700">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Setujui & Aktifkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Pendaftaran</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Menolak pendaftaran <strong>{registration.full_name}</strong>. Akun user tetap ada namun tidak aktif sebagai siswa.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="reject-reason">Alasan Penolakan *</Label>
                            <Textarea
                                id="reject-reason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Jelaskan alasan penolakan (misal: kuota penuh, data tidak lengkap, dll.)"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isLoading || !rejectReason.trim()}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tolak Pendaftaran'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
