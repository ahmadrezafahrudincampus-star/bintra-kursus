'use client'

import { useState, useTransition } from 'react'
import { createAnnouncement, toggleAnnouncement, deleteAnnouncement } from '@/lib/actions/announcement'
import type { Announcement } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Eye, EyeOff, Trash2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'

interface AnnouncementAdminClientProps {
    initialAnnouncements: Announcement[]
    sessions: { id: string; name: string }[]
}

export function AnnouncementAdminClient({ initialAnnouncements, sessions }: AnnouncementAdminClientProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
    const [showForm, setShowForm] = useState(false)
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
            } else {
                toast.success('Pengumuman berhasil dibuat')
                setShowForm(false)
                setForm({ title: '', content: '', target_session_id: '' })
                window.location.reload()
            }
        })
    }

    const handleToggle = (id: string, current: boolean) => {
        startTransition(async () => {
            const result = await toggleAnnouncement(id, !current)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setAnnouncements((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a))
                toast.success(!current ? 'Pengumuman diaktifkan' : 'Pengumuman dinonaktifkan')
            }
        })
    }

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Hapus pengumuman "${title}"?`)) return
        startTransition(async () => {
            const result = await deleteAnnouncement(id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setAnnouncements((prev) => prev.filter((a) => a.id !== id))
                toast.success('Pengumuman dihapus')
            }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{announcements.length} pengumuman terdaftar</p>
                <Button size="sm" onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'default'}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Buat Pengumuman
                </Button>
            </div>

            {showForm && (
                <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                    <p className="text-sm font-semibold">Pengumuman Baru</p>
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Judul *</label>
                            <input
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Judul pengumuman..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Isi Pengumuman *</label>
                            <textarea
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                                rows={3} value={form.content}
                                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                placeholder="Tulis isi pengumuman di sini..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Target Sesi (kosongkan = semua siswa)</label>
                            <select
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.target_session_id}
                                onChange={(e) => setForm((f) => ({ ...f, target_session_id: e.target.value }))}
                            >
                                <option value="">Semua Siswa</option>
                                {sessions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreate} disabled={isPending}>
                            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            Simpan
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                    </div>
                </div>
            )}

            {announcements.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    <Megaphone className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p>Belum ada pengumuman. Klik "Buat Pengumuman" untuk memulai.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {announcements.map((a) => (
                        <div key={a.id} className={`p-4 rounded-xl border transition-colors ${a.is_active ? 'border-border bg-background' : 'border-dashed border-muted-foreground/30 bg-muted/30'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`font-medium text-sm ${!a.is_active ? 'text-muted-foreground' : ''}`}>{a.title}</p>
                                        {!a.is_active && <span className="text-xs text-muted-foreground/60">(Nonaktif)</span>}
                                        {a.target_session_id && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">Sesi spesifik</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{a.content}</p>
                                    <p className="text-xs text-muted-foreground/60">
                                        {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <Button size="icon" variant="ghost" className="w-8 h-8" onClick={() => handleToggle(a.id, a.is_active)} disabled={isPending}>
                                        {a.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </Button>
                                    <Button size="icon" variant="ghost" className="w-8 h-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(a.id, a.title)} disabled={isPending}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
