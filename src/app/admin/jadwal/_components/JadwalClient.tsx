'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Calendar,
    Clock,
    Eye,
    Layers3,
    List,
    MapPin,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
    User,
    Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Badge } from '@/components/ui/badge'
import {
    createSession,
    deleteSession,
    toggleSessionStatus,
    updateSession,
    type SessionFormInput,
} from '@/lib/actions/sessions'

type SessionListItem = {
    id: string
    name: string
    course_id: string
    course_name: string
    course_level: string
    instructor_name: string
    room: string
    day_of_week: string
    start_time: string
    end_time: string
    max_capacity: number
    current_count: number
    is_active: boolean
}

type CourseOption = {
    id: string
    name: string
    level: string
}

type JadwalClientProps = {
    initialSessions: SessionListItem[]
    courses: CourseOption[]
}

type DialogMode = 'create' | 'edit' | 'delete' | null
type ViewMode = 'card' | 'list'

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const

const DEFAULT_FORM: SessionFormInput = {
    course_id: '',
    name: '',
    instructor_name: '',
    day_of_week: 'Senin',
    start_time: '08:00',
    end_time: '09:30',
    max_capacity: 25,
    room: 'Lab Komputer',
}

function formatTime(value: string) {
    return value.slice(0, 5)
}

function toTimeInput(value: string) {
    return value.slice(0, 5)
}

export function JadwalClient({ initialSessions, courses }: JadwalClientProps) {
    const router = useRouter()
    const [viewMode, setViewMode] = useState<ViewMode>('card')
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDay, setFilterDay] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [dialogMode, setDialogMode] = useState<DialogMode>(null)
    const [form, setForm] = useState<SessionFormInput>(DEFAULT_FORM)
    const [targetSession, setTargetSession] = useState<SessionListItem | null>(null)
    const [isPending, startTransition] = useTransition()

    const filteredSessions = useMemo(() => {
        return initialSessions.filter((session) => {
            const query = searchQuery.trim().toLowerCase()
            const matchesSearch =
                query.length === 0 ||
                session.name.toLowerCase().includes(query) ||
                session.course_name.toLowerCase().includes(query) ||
                session.instructor_name.toLowerCase().includes(query)

            const matchesDay = filterDay === 'all' || session.day_of_week === filterDay
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && session.is_active) ||
                (filterStatus === 'inactive' && !session.is_active) ||
                (filterStatus === 'full' && session.current_count >= session.max_capacity)

            return matchesSearch && matchesDay && matchesStatus
        })
    }, [filterDay, filterStatus, initialSessions, searchQuery])

    const summary = useMemo(() => {
        const activeSessions = initialSessions.filter((session) => session.is_active).length
        const fullSessions = initialSessions.filter((session) => session.current_count >= session.max_capacity).length
        const totalStudents = initialSessions.reduce((sum, session) => sum + session.current_count, 0)

        return { activeSessions, fullSessions, totalStudents }
    }, [initialSessions])

    const resetDialog = () => {
        setDialogMode(null)
        setTargetSession(null)
        setForm(DEFAULT_FORM)
    }

    const openCreate = () => {
        setForm(DEFAULT_FORM)
        setTargetSession(null)
        setDialogMode('create')
    }

    const openEdit = (session: SessionListItem) => {
        setTargetSession(session)
        setForm({
            course_id: session.course_id,
            name: session.name,
            instructor_name: session.instructor_name,
            day_of_week: session.day_of_week,
            start_time: toTimeInput(session.start_time),
            end_time: toTimeInput(session.end_time),
            max_capacity: session.max_capacity,
            room: session.room,
        })
        setDialogMode('edit')
    }

    const openDelete = (session: SessionListItem) => {
        setTargetSession(session)
        setDialogMode('delete')
    }

    const submitSession = () => {
        startTransition(async () => {
            const result =
                dialogMode === 'edit' && targetSession
                    ? await updateSession(targetSession.id, form)
                    : await createSession(form)

            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success(dialogMode === 'edit' ? 'Sesi berhasil diperbarui.' : 'Sesi baru berhasil dibuat.')
            resetDialog()
            router.refresh()
        })
    }

    const removeSession = () => {
        if (!targetSession) return

        startTransition(async () => {
            const result = await deleteSession(targetSession.id)
            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success('Sesi berhasil dihapus.')
            resetDialog()
            router.refresh()
        })
    }

    const handleToggleStatus = (session: SessionListItem) => {
        startTransition(async () => {
            const result = await toggleSessionStatus(session.id, !session.is_active)
            if ('error' in result) {
                toast.error(result.error)
                return
            }

            toast.success(session.is_active ? 'Sesi berhasil dinonaktifkan.' : 'Sesi berhasil diaktifkan.')
            router.refresh()
        })
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Sesi Aktif</p><p className="mt-1 text-2xl font-bold">{summary.activeSessions}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Sesi Penuh</p><p className="mt-1 text-2xl font-bold">{summary.fullSessions}</p></CardContent></Card>
                <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Total Siswa Terjadwal</p><p className="mt-1 text-2xl font-bold">{summary.totalStudents}</p></CardContent></Card>
            </div>

            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-1 flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari sesi, program, atau instruktur..." className="pl-9" />
                        </div>
                        <Select value={filterDay} onValueChange={(value) => setFilterDay(value ?? 'all')}>
                            <SelectTrigger className="w-full md:w-[150px]"><SelectValue placeholder="Filter hari" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Hari</SelectItem>
                                {DAYS.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? 'all')}>
                            <SelectTrigger className="w-full md:w-[170px]"><SelectValue placeholder="Filter status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Nonaktif</SelectItem>
                                <SelectItem value="full">Penuh</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex rounded-lg border border-border p-1">
                            <Button type="button" variant={viewMode === 'card' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('card')}><Layers3 className="h-4 w-4" />Card</Button>
                            <Button type="button" variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" />List</Button>
                        </div>
                        <Button type="button" onClick={openCreate}><Plus className="h-4 w-4" />Buat Sesi</Button>
                    </div>
                </CardContent>
            </Card>

            {filteredSessions.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <Calendar className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Belum ada sesi yang cocok dengan filter ini.</p>
                        <p className="mt-1 text-sm">Coba ubah filter atau buat sesi baru.</p>
                    </CardContent>
                </Card>
            ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {filteredSessions.map((session) => {
                        const isFull = session.current_count >= session.max_capacity

                        return (
                            <Card key={session.id} className="border-border/60">
                                <CardHeader className="border-b border-border/50 pb-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-base">{session.name}</CardTitle>
                                            <p className="mt-1 text-sm text-muted-foreground">{session.course_name}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <Badge variant={session.is_active ? 'default' : 'secondary'}>
                                                {session.is_active ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                            {isFull ? <Badge variant="destructive">Penuh</Badge> : null}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                                            <p className="text-xs text-muted-foreground">Jadwal</p>
                                            <p className="mt-1 flex items-center gap-2 font-medium">
                                                <Clock className="h-4 w-4 text-primary" />
                                                {session.day_of_week}, {formatTime(session.start_time)} - {formatTime(session.end_time)}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                                            <p className="text-xs text-muted-foreground">Instruktur</p>
                                            <p className="mt-1 flex items-center gap-2 font-medium">
                                                <User className="h-4 w-4 text-primary" />
                                                {session.instructor_name || 'Belum diisi'}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                                            <p className="text-xs text-muted-foreground">Ruangan</p>
                                            <p className="mt-1 flex items-center gap-2 font-medium">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                {session.room}
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
                                            <p className="text-xs text-muted-foreground">Kapasitas</p>
                                            <p className="mt-1 flex items-center gap-2 font-medium">
                                                <Users className="h-4 w-4 text-primary" />
                                                {session.current_count}/{session.max_capacity} siswa
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/admin/sesi/${session.id}`}>
                                                <Eye className="h-4 w-4" />
                                                Buka
                                            </Link>
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => openEdit(session)}>
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => handleToggleStatus(session)} disabled={isPending}>
                                            <Power className="h-4 w-4" />
                                            {session.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                        </Button>
                                        <Button asChild size="sm" variant="outline">
                                            <Link href={`/admin/absensi?session=${session.id}`}>
                                                <Calendar className="h-4 w-4" />
                                                Absensi
                                            </Link>
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => openDelete(session)}>
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/60 text-left text-muted-foreground">
                                        <th className="px-4 py-3 font-medium">Sesi</th>
                                        <th className="px-4 py-3 font-medium">Program</th>
                                        <th className="px-4 py-3 font-medium">Jadwal</th>
                                        <th className="px-4 py-3 font-medium">Kapasitas</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {filteredSessions.map((session) => (
                                        <tr key={session.id} className="align-top">
                                            <td className="px-4 py-4">
                                                <p className="font-medium">{session.name}</p>
                                                <p className="text-xs text-muted-foreground">{session.instructor_name || 'Instruktur belum diisi'}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>{session.course_name}</p>
                                                <p className="text-xs capitalize text-muted-foreground">{session.course_level}</p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p>{session.day_of_week}</p>
                                                <p className="text-xs text-muted-foreground">{formatTime(session.start_time)} - {formatTime(session.end_time)}</p>
                                            </td>
                                            <td className="px-4 py-4">{session.current_count}/{session.max_capacity}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant={session.is_active ? 'default' : 'secondary'}>
                                                        {session.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                    {session.current_count >= session.max_capacity ? <Badge variant="destructive">Penuh</Badge> : null}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button asChild size="sm" variant="outline"><Link href={`/admin/sesi/${session.id}`}>Detail</Link></Button>
                                                    <Button type="button" size="sm" variant="outline" onClick={() => openEdit(session)}>Edit</Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Dialog open={dialogMode === 'create' || dialogMode === 'edit'} onOpenChange={(open) => (!open ? resetDialog() : null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{dialogMode === 'edit' ? 'Edit Sesi Kelas' : 'Buat Sesi Kelas'}</DialogTitle>
                        <DialogDescription>
                            Satu sesi adalah kombinasi program, hari, jam, instruktur, dan kapasitas untuk satu lab komputer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="course_id">Program Kursus</Label>
                            <Select value={form.course_id} onValueChange={(value) => setForm((current) => ({ ...current, course_id: value ?? '' }))}>
                                <SelectTrigger><SelectValue placeholder="Pilih program kursus" /></SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => <SelectItem key={course.id} value={course.id}>{course.name} ({course.level})</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Sesi</Label>
                            <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Contoh: Office Word - Senin Pagi" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="day_of_week">Hari</Label>
                                <Select value={form.day_of_week} onValueChange={(value) => setForm((current) => ({ ...current, day_of_week: value ?? 'Senin' }))}>
                                    <SelectTrigger><SelectValue placeholder="Pilih hari" /></SelectTrigger>
                                    <SelectContent>
                                        {DAYS.map((day) => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_capacity">Kapasitas</Label>
                                <Input id="max_capacity" type="number" min={1} max={50} value={form.max_capacity} onChange={(event) => setForm((current) => ({ ...current, max_capacity: Number(event.target.value || 0) }))} />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="start_time">Jam Mulai</Label>
                                <Input id="start_time" type="time" value={form.start_time} onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_time">Jam Selesai</Label>
                                <Input id="end_time" type="time" value={form.end_time} onChange={(event) => setForm((current) => ({ ...current, end_time: event.target.value }))} />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="instructor_name">Instruktur</Label>
                                <Input id="instructor_name" value={form.instructor_name ?? ''} onChange={(event) => setForm((current) => ({ ...current, instructor_name: event.target.value }))} placeholder="Nama instruktur" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room">Ruangan</Label>
                                <Input id="room" value={form.room ?? 'Lab Komputer'} onChange={(event) => setForm((current) => ({ ...current, room: event.target.value }))} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetDialog}>Batal</Button>
                        <Button type="button" onClick={submitSession} disabled={isPending}>
                            {isPending ? 'Menyimpan...' : dialogMode === 'edit' ? 'Simpan Perubahan' : 'Buat Sesi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={dialogMode === 'delete'} onOpenChange={(open) => (!open ? resetDialog() : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Sesi</DialogTitle>
                        <DialogDescription>
                            {targetSession ? `Sesi "${targetSession.name}" akan dihapus permanen. Aksi ini hanya bisa dilakukan bila tidak ada siswa ACTIVE.` : 'Konfirmasi penghapusan sesi.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetDialog}>Batal</Button>
                        <Button type="button" variant="destructive" onClick={removeSession} disabled={isPending}>
                            {isPending ? 'Menghapus...' : 'Hapus Sesi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
