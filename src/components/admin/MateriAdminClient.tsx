'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createMateri, deleteMateri, toggleMateriPublish } from '@/lib/actions/materi'
import type { CourseMaterial } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Eye,
    EyeOff,
    File,
    FileText,
    Link as LinkIcon,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Video,
    X,
} from 'lucide-react'
import { toast } from 'sonner'

const TYPE_ICONS: Record<string, React.ReactNode> = {
    PDF: <FileText className="h-4 w-4" />,
    VIDEO: <Video className="h-4 w-4" />,
    LINK: <LinkIcon className="h-4 w-4" />,
    OTHER: <File className="h-4 w-4" />,
}

const MATERIALS_BUCKET = 'course-materials'
const ACCEPT_MAP = {
    PDF: '.pdf,application/pdf',
    VIDEO: 'video/*,.mp4,.mov,.webm',
    LINK: '',
    OTHER: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.webp',
} as const

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

type MateriFormState = {
    title: string
    description: string
    material_type: 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
    file_url: string
    external_url: string
    order_index: number
}

interface MateriAdminClientProps {
    courseId: string
    courseName: string
    initialMateri: CourseMaterial[]
}

function formatFileSize(size: number) {
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function sanitizeFileName(fileName: string) {
    return fileName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, '-')
        .replace(/-+/g, '-')
}

export function MateriAdminClient({ courseId, courseName, initialMateri }: MateriAdminClientProps) {
    const router = useRouter()
    const [materi, setMateri] = useState<CourseMaterial[]>(initialMateri)
    const [showForm, setShowForm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<CourseMaterial | null>(null)
    const [isPending, startTransition] = useTransition()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState<MateriFormState>({
        title: '',
        description: '',
        material_type: 'PDF',
        file_url: '',
        external_url: '',
        order_index: initialMateri.length + 1,
    })

    const resetForm = (nextOrderIndex: number) => {
        setForm({
            title: '',
            description: '',
            material_type: 'PDF',
            file_url: '',
            external_url: '',
            order_index: nextOrderIndex,
        })
        setSelectedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSelectFile = (file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error('Ukuran file maksimal 50MB')
            return
        }
        setSelectedFile(file)
    }

    const handleCreate = async () => {
        if (!form.title.trim()) {
            toast.error('Judul materi harus diisi')
            return
        }

        if (!selectedFile && !form.file_url.trim() && !form.external_url.trim()) {
            toast.error('Upload dokumen terlebih dahulu atau isi URL materi')
            return
        }

        setIsUploading(true)

        try {
            let uploadedFileUrl = form.file_url.trim() || undefined

            if (selectedFile) {
                const supabase = createClient()
                const {
                    data: { user },
                } = await supabase.auth.getUser()
                if (!user) {
                    setIsUploading(false)
                    toast.error('Sesi login berakhir. Silakan login ulang.')
                    return
                }

                const path = `${courseId}/${user.id}/${Date.now()}-${sanitizeFileName(selectedFile.name)}`
                const { error: uploadError } = await supabase.storage
                    .from(MATERIALS_BUCKET)
                    .upload(path, selectedFile, {
                        contentType: selectedFile.type || undefined,
                        upsert: false,
                    })

                if (uploadError) throw uploadError

                const {
                    data: { publicUrl },
                } = supabase.storage.from(MATERIALS_BUCKET).getPublicUrl(path)

                uploadedFileUrl = publicUrl
            }

            startTransition(async () => {
                const result = await createMateri({
                    course_id: courseId,
                    title: form.title,
                    description: form.description || undefined,
                    file_url: uploadedFileUrl,
                    external_url: form.external_url.trim() || undefined,
                    material_type: form.material_type,
                    order_index: form.order_index,
                })

                setIsUploading(false)

                if (result?.error) {
                    toast.error(result.error)
                    return
                }

                toast.success('Materi berhasil ditambahkan')
                setShowForm(false)

                if (result.material) {
                    setMateri((prev) => [...prev, result.material!].sort((a, b) => a.order_index - b.order_index))
                    resetForm(materi.length + 2)
                } else {
                    resetForm(materi.length + 2)
                    router.refresh()
                }
            })
        } catch (error) {
            setIsUploading(false)
            toast.error(error instanceof Error ? error.message : 'Gagal mengupload file materi')
        }
    }

    const handleToggle = (id: string, current: boolean) => {
        startTransition(async () => {
            const result = await toggleMateriPublish(id, !current)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setMateri((prev) => prev.map((item) => item.id === id ? { ...item, is_published: !current } : item))
                toast.success(!current ? 'Materi dipublish' : 'Materi disembunyikan')
            }
        })
    }

    const confirmDelete = () => {
        if (!deleteTarget) return

        startTransition(async () => {
            const result = await deleteMateri(deleteTarget.id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setMateri((prev) => prev.filter((item) => item.id !== deleteTarget.id))
                toast.success('Materi dihapus')
                setDeleteTarget(null)
            }
        })
    }

    const isSubmitDisabled = isPending || isUploading
    const showUploadArea = form.material_type !== 'LINK'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{materi.length} materi untuk <strong>{courseName}</strong></p>
                <Button size="sm" onClick={() => setShowForm((value) => !value)} variant={showForm ? 'outline' : 'default'}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Tambah Materi
                </Button>
            </div>

            {showForm ? (
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm font-semibold">Tambah Materi Baru</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium">Judul *</label>
                            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Contoh: Pengenalan Interface Microsoft Word" />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-medium">Deskripsi</label>
                            <textarea className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm" rows={2} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Penjelasan singkat materi..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Tipe Materi</label>
                            <select
                                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                value={form.material_type}
                                onChange={(event) => {
                                    const nextType = event.target.value as 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
                                    setForm((current) => ({ ...current, material_type: nextType }))
                                    setSelectedFile(null)
                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                }}
                            >
                                <option value="PDF">PDF</option>
                                <option value="VIDEO">Video</option>
                                <option value="LINK">Link</option>
                                <option value="OTHER">Lainnya</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Urutan</label>
                            <input type="number" min={1} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.order_index} onChange={(event) => setForm((current) => ({ ...current, order_index: Number.parseInt(event.target.value, 10) || 1 }))} />
                        </div>
                        {showUploadArea ? (
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-medium">Upload Dokumen / File Materi</label>
                                <div className="rounded-xl border border-dashed border-border bg-background/80 p-4">
                                    {selectedFile ? (
                                        <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                                                <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted" onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} aria-label="Hapus file">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                                <Upload className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Pilih file dari komputer</p>
                                                <p className="mt-1 text-xs text-muted-foreground">PDF, Word, Excel, PowerPoint, gambar, atau video singkat. Maksimal 50MB.</p>
                                            </div>
                                            <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                                <Upload className="mr-2 h-4 w-4" />
                                                Pilih File
                                            </Button>
                                        </div>
                                    )}
                                    <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPT_MAP[form.material_type]} onChange={(event) => { const file = event.target.files?.[0]; if (file) handleSelectFile(file) }} />
                                </div>
                            </div>
                        ) : null}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">{showUploadArea ? 'URL File Cadangan (Opsional)' : 'URL File'}</label>
                            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.file_url} onChange={(event) => setForm((current) => ({ ...current, file_url: event.target.value }))} placeholder="https://drive.google.com/..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">URL Eksternal</label>
                            <input className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={form.external_url} onChange={(event) => setForm((current) => ({ ...current, external_url: event.target.value }))} placeholder="https://youtube.com/..." />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={handleCreate} disabled={isSubmitDisabled}>
                            {isSubmitDisabled ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                            {isUploading ? 'Mengupload...' : 'Simpan'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                    </div>
                </div>
            ) : null}

            {materi.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                    Belum ada materi. Klik "Tambah Materi" untuk mulai.
                </div>
            ) : (
                <div className="space-y-2">
                    {materi.map((item) => (
                        <div key={item.id} className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${item.is_published ? 'border-border/60 bg-background' : 'border-dashed border-muted-foreground/30 bg-muted/30'}`}>
                            <div className={`shrink-0 text-muted-foreground ${item.is_published ? 'opacity-100' : 'opacity-40'}`}>
                                {TYPE_ICONS[item.material_type] ?? <File className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${!item.is_published ? 'text-muted-foreground' : ''}`}>{item.order_index}. {item.title}</span>
                                    {!item.is_published ? <span className="text-xs text-muted-foreground/60">(Draft)</span> : null}
                                </div>
                                {item.description ? <p className="truncate text-xs text-muted-foreground">{item.description}</p> : null}
                            </div>
                            <div className="flex shrink-0 gap-1.5">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleToggle(item.id, item.is_published)} disabled={isPending} title={item.is_published ? 'Sembunyikan' : 'Publish'}>
                                    {item.is_published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(item)} disabled={isPending} title="Hapus">
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={deleteTarget !== null} onOpenChange={(open) => (!open ? setDeleteTarget(null) : null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Materi</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        {deleteTarget ? `Materi "${deleteTarget.title}" akan dihapus permanen.` : 'Konfirmasi penghapusan materi.'}
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
