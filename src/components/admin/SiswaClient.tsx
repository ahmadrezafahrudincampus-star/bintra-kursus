'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, CreditCard, GraduationCap, Layers3, List, RefreshCcw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { transferStudentSession } from '@/lib/actions/sessions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

export type StudentListItem = {
    enrollment_id: string
    profile_id: string
    full_name: string
    phone: string | null
    participant_category: 'SMP' | 'SMA' | 'Umum'
    enrolled_at: string
    current_session_id: string
    course_id: string
    session_name: string
    day_of_week: string
    start_time: string
    end_time: string
    course_name: string
    open_invoices: number
}

type SessionOption = {
    id: string
    name: string
    day_of_week: string
    start_time: string
    end_time: string
    current_count: number
    max_capacity: number
}

type ViewMode = 'list' | 'card'

const CATEGORY_VARIANT: Record<StudentListItem['participant_category'], 'default' | 'secondary' | 'outline'> = {
    SMP: 'default',
    SMA: 'secondary',
    Umum: 'outline',
}

export function SiswaClient({
    students,
    sessionOptionsByCourse,
}: {
    students: StudentListItem[]
    sessionOptionsByCourse: Record<string, SessionOption[]>
}) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterCategory, setFilterCategory] = useState<'all' | StudentListItem['participant_category']>('all')
    const [filterInvoice, setFilterInvoice] = useState<'all' | 'with_due' | 'clear'>('all')
    const [transferTarget, setTransferTarget] = useState<StudentListItem | null>(null)
    const [selectedSessionId, setSelectedSessionId] = useState('')
    const [isPending, startTransition] = useTransition()

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const query = searchQuery.trim().toLowerCase()
            const matchQuery =
                query.length === 0 ||
                student.full_name.toLowerCase().includes(query) ||
                student.course_name.toLowerCase().includes(query) ||
                student.session_name.toLowerCase().includes(query) ||
                (student.phone ?? '').toLowerCase().includes(query)

            const matchCategory = filterCategory === 'all' || student.participant_category === filterCategory
            const matchInvoice =
                filterInvoice === 'all' ||
                (filterInvoice === 'with_due' && student.open_invoices > 0) ||
                (filterInvoice === 'clear' && student.open_invoices === 0)

            return matchQuery && matchCategory && matchInvoice
        })
    }, [filterCategory, filterInvoice, searchQuery, students])

    const availableSessions = useMemo(() => {
        if (!transferTarget) return []
        return (sessionOptionsByCourse[transferTarget.course_id] ?? []).filter(
            (session) => session.id !== transferTarget.current_session_id
        )
    }, [sessionOptionsByCourse, transferTarget])

    const selectedSession = availableSessions.find((session) => session.id === selectedSessionId) ?? null
    const selectedSessionFull =
        selectedSession !== null && selectedSession.current_count >= selectedSession.max_capacity

    function openTransferDialog(student: StudentListItem) {
        setTransferTarget(student)
        setSelectedSessionId('')
    }

    function closeTransferDialog() {
        setTransferTarget(null)
        setSelectedSessionId('')
    }

    function handleTransfer() {
        if (!transferTarget) return
        if (!selectedSessionId) {
            toast.error('Pilih sesi tujuan terlebih dahulu.')
            return
        }

        startTransition(async () => {
            const result = await transferStudentSession(transferTarget.enrollment_id, selectedSessionId)
            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success(`Sesi ${transferTarget.full_name} berhasil dipindahkan.`)
            closeTransferDialog()
            router.refresh()
        })
    }

    if (students.length === 0) {
        return (
            <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                    <GraduationCap className="mx-auto mb-3 h-12 w-12 opacity-20" />
                    <p>Belum ada siswa aktif.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari siswa, program, sesi, atau nomor HP..." className="pl-9" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'SMP', 'SMA', 'Umum'] as const).map((category) => (
                                <Button key={category} type="button" variant={filterCategory === category ? 'default' : 'outline'} size="sm" onClick={() => setFilterCategory(category)}>
                                    {category === 'all' ? 'Semua Kategori' : category}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {([['all', 'Semua Tagihan'], ['with_due', 'Ada Tunggakan'], ['clear', 'Lancar']] as const).map(([value, label]) => (
                            <Button key={value} type="button" variant={filterInvoice === value ? 'default' : 'outline'} size="sm" onClick={() => setFilterInvoice(value)}>
                                {label}
                            </Button>
                        ))}
                        <div className="flex rounded-lg border border-border p-1">
                            <Button type="button" size="sm" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')}>
                                <List className="h-4 w-4" />
                                List
                            </Button>
                            <Button type="button" size="sm" variant={viewMode === 'card' ? 'default' : 'ghost'} onClick={() => setViewMode('card')}>
                                <Layers3 className="h-4 w-4" />
                                Card
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {filteredStudents.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Search className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p>Tidak ada siswa yang cocok dengan filter saat ini.</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'list' ? (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Nama Siswa</th>
                                        <th className="px-4 py-3 font-medium">Kategori</th>
                                        <th className="px-4 py-3 font-medium">Program</th>
                                        <th className="px-4 py-3 font-medium">Sesi</th>
                                        <th className="px-4 py-3 font-medium">Tagihan</th>
                                        <th className="px-4 py-3 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {filteredStudents.map((student) => (
                                        <tr key={student.enrollment_id}>
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{student.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{student.phone ?? 'No. HP belum diisi'}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Badge variant={CATEGORY_VARIANT[student.participant_category]}>
                                                    {student.participant_category}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-4">{student.course_name}</td>
                                            <td className="px-4 py-4">
                                                <p>{student.session_name}</p>
                                                <p className="text-xs text-muted-foreground">{student.day_of_week} {student.start_time.slice(0, 5)}-{student.end_time.slice(0, 5)}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                {student.open_invoices > 0 ? (
                                                    <div className="flex items-center gap-2 text-orange-600">
                                                        <AlertCircle className="h-4 w-4" />
                                                        <span>{student.open_invoices} tagihan</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>Lancar</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <Button type="button" size="sm" variant="outline" onClick={() => openTransferDialog(student)}>
                                                    <RefreshCcw className="h-4 w-4" />
                                                    Pindah Sesi
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {filteredStudents.map((student) => (
                        <Card key={student.enrollment_id}>
                            <CardContent className="space-y-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold">{student.full_name}</p>
                                        <p className="text-sm text-muted-foreground">{student.phone ?? 'No. HP belum diisi'}</p>
                                    </div>
                                    <Badge variant={CATEGORY_VARIANT[student.participant_category]}>
                                        {student.participant_category}
                                    </Badge>
                                </div>
                                <div className="grid gap-3 text-sm md:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Program</p>
                                        <p className="font-medium">{student.course_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Sesi</p>
                                        <p className="font-medium">{student.session_name}</p>
                                        <p className="text-xs text-muted-foreground">{student.day_of_week} {student.start_time.slice(0, 5)}-{student.end_time.slice(0, 5)}</p>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
                                    {student.open_invoices > 0 ? (
                                        <div className="flex items-center gap-2 text-orange-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="font-medium">{student.open_invoices} tagihan masih terbuka</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <CreditCard className="h-4 w-4" />
                                            <span className="font-medium">Tidak ada tunggakan</span>
                                        </div>
                                    )}
                                </div>
                                <Button type="button" variant="outline" onClick={() => openTransferDialog(student)}>
                                    <RefreshCcw className="h-4 w-4" />
                                    Pindah ke Sesi Lain
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={transferTarget !== null} onOpenChange={(open) => (!open ? closeTransferDialog() : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Pindahkan Siswa ke Sesi Lain</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                            <p className="font-medium">{transferTarget?.full_name ?? '-'}</p>
                            <p className="text-muted-foreground">
                                {transferTarget?.course_name ?? '-'} · Sesi saat ini: {transferTarget?.session_name ?? '-'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Sesi Tujuan</Label>
                            {availableSessions.length > 0 ? (
                                <Select value={selectedSessionId} onValueChange={(value) => setSelectedSessionId(value ?? '')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih sesi tujuan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSessions.map((session) => {
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
                            ) : (
                                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-700">
                                    Belum ada sesi alternatif aktif untuk program ini.
                                </div>
                            )}
                        </div>

                        {selectedSession ? (
                            <div className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
                                <p className="font-medium">{selectedSession.name}</p>
                                <p className="text-muted-foreground">
                                    {selectedSession.day_of_week} {selectedSession.start_time.slice(0, 5)}-{selectedSession.end_time.slice(0, 5)}
                                </p>
                                <p className="mt-1">
                                    Kapasitas: {selectedSession.current_count}/{selectedSession.max_capacity}
                                </p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeTransferDialog}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleTransfer} disabled={isPending || !selectedSessionId || selectedSessionFull}>
                            {isPending ? 'Memindahkan...' : 'Pindahkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
