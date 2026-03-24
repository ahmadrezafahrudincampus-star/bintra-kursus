'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createAnnouncement, deleteAnnouncement, toggleAnnouncement } from '@/lib/actions/announcement'
import type { Announcement } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Megaphone, Plus, Eye, EyeOff, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnnouncementAdminClientProps {
    initialAnnouncements: Announcement[]
    sessions: { id: string; name: string }[]
}

export function AnnouncementAdminClient({ initialAnnouncements, sessions }: AnnouncementAdminClientProps) {
    const router = useRouter()
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
    const [showForm, setShowForm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)
    const [isPending, startTransition] = useTransition()
    const [form, setForm] = useState({ title: '', content: '', target_session_id: '' })

    const handleCreate = () => {
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('Judul dan isi pengumuman harus diisi')
            return
        }

        startTransition(async () => {
            const result = await createAnnouncement({
                title: form.title,
                content: form.content,
                target_session_id: form.target_session_id || null,
            })

            if (result?.error) {
                toast.error(result.error)
                return
            }

            toast.success('Pengumuman berhasil dibuat')
            setShowForm(false)
            setForm({ title: '', content: '', target_session_id: '' })

            if (result.announcement) {
                setAnnouncements((prev) => [result.announcement!, ...prev])
            } else {
                router.refresh()
            }
        })
    }

    const handleToggle = (id: string, current: boolean) => {
        startTransition(async () => {
            const result = await toggleAnnouncement(id, !current)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setAnnouncements((prev) => prev.map((announcement) => announcement.id === id ? { ...announcement, is_active: !current } : announcement))
                toast.success(!current ? 'Pengumuman diaktifkan' : 'Pengumuman dinonaktifkan')
            }
        })
    }

    const confirmDelete = () => {
        if (!deleteTarget) return

        startTransition(async () => {
            const result = await deleteAnnouncement(deleteTarget.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== deleteTarget.id))
                toast.success('Pengumuman dihapus')
                setDeleteTarget(null)
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{announcements.length} pengumuman terdaftar</p>
                <Button size="sm" onClick={() => setShowForm((value) => !value)} variant={showForm ? 'outline' : 'default'}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Buat Pengumuman
                </Button>
            </div>

            {showForm ? (
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold">Pengumuman Baru</p>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Judul *</label>
                            <input
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                value={form.title}
                                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                placeholder="Judul pengumuman..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Isi Pengumuman *</label>
                            <textarea
                                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                rows={3}
                                value={form.content}
                                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                                placeholder="Tulis isi pengumuman di sini..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Target Sesi</label>
                            <select
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                value={form.target_session_id}
                                onChange={(event) => setForm((current) => ({ ...current, target_session_id: event.target.value }))}
                            >
                                <option value="">Semua Siswa</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>{session.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreate} disabled={isPending}>
                            {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                            Simpan
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                    </div>
                </div>
            ) : null}

            {announcements.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                    <Megaphone className="mx-auto mb-2 h-10 w-10 opacity-20" />
                    <p>Belum ada pengumuman. Klik "Buat Pengumuman" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {announcements.map((announcement) => (
                        <div key={announcement.id} className={`rounded-xl border p-4 transition-colors ${announcement.is_active ? 'border-border bg-background' : 'border-dashed border-muted-foreground/30 bg-muted/30'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-medium ${!announcement.is_active ? 'text-muted-foreground' : ''}`}>{announcement.title}</p>
                                        {!announcement.is_active ? <span className="text-xs text-muted-foreground/60">(Nonaktif)</span> : null}
                                        {announcement.target_session_id ? <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">Sesi spesifik</span> : null}
                                    </div>
                                    <p className="line-clamp-2 text-xs text-muted-foreground">{announcement.content}</p>
                                    <p className="text-xs text-muted-foreground/60">
                                        {new Date(announcement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-1.5">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleToggle(announcement.id, announcement.is_active)} disabled={isPending}>
                                        {announcement.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(announcement)} disabled={isPending}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={deleteTarget !== null} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pengumuman</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {deleteTarget ? `Pengumuman "${deleteTarget.title}" akan dihapus permanen.` : 'Konfirmasi penghapusan pengumuman.'}
                    </p>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
                        <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isPending}>
                            {isPending ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
