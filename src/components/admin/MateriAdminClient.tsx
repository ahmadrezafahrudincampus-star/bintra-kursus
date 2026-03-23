'use client'

import { useRef, useState, useTransition } from 'react'
import { createMateri, toggleMateriPublish, deleteMateri } from '@/lib/actions/materi'
import { createClient } from '@/lib/supabase/client'
import type { CourseMaterial } from '@/types/database'
import { Button } from '@/components/ui/button'
import {
    Loader2, Plus, Eye, EyeOff, Trash2,
    Link as LinkIcon, FileText, Video, File, Upload, X,
} from 'lucide-react'
import { toast } from 'sonner'

const TYPE_ICONS: Record<string, React.ReactNode> = {
    PDF: <FileText className="w-4 h-4" />,
    VIDEO: <Video className="w-4 h-4" />,
    LINK: <LinkIcon className="w-4 h-4" />,
    OTHER: <File className="w-4 h-4" />,
}

const MATERIALS_BUCKET = 'course-materials'
const ACCEPT_MAP = {
    PDF: '.pdf,application/pdf',
    VIDEO: 'video/*,.mp4,.mov,.webm',
    LINK: '',
    OTHER: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.jpg,.jpeg,.png,.webp',
} as const

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

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

interface MateriAdminClientProps {
    courseId: string
    courseName: string
    initialMateri: CourseMaterial[]
}

export function MateriAdminClient({ courseId, courseName, initialMateri }: MateriAdminClientProps) {
    const [materi, setMateri] = useState<CourseMaterial[]>(initialMateri)
    const [showForm, setShowForm] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [form, setForm] = useState({
        title: '', description: '', material_type: 'PDF' as const,
        file_url: '', external_url: '', order_index: materi.length + 1,
    })

    const handleSelectFile = (file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error('Ukuran file maksimal 50MB')
            return
        }

        setSelectedFile(file)
    }

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

    const handleCreate = async () => {
        if (!form.title.trim()) { toast.error('Judul materi harus diisi'); return }

        if (form.material_type !== 'LINK' && !selectedFile && !form.file_url.trim() && !form.external_url.trim()) {
            toast.error('Upload dokumen terlebih dahulu atau isi URL file')
            return
        }

        if (form.material_type === 'LINK' && !selectedFile && !form.file_url.trim() && !form.external_url.trim()) {
            toast.error('Isi URL eksternal atau upload file materi')
            return
        }

        setIsUploading(true)

        try {
            let uploadedFileUrl = form.file_url.trim() || undefined

            if (selectedFile) {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
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

                const { data: { publicUrl } } = supabase.storage
                    .from(MATERIALS_BUCKET)
                    .getPublicUrl(path)

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
                if (result?.error) {
                    toast.error(result.error)
                } else {
                    toast.success('Materi berhasil ditambahkan')
                    setShowForm(false)
                    if (result.material) {
                        setMateri((prev) => [...prev, result.material!].sort((a, b) => a.order_index - b.order_index))
                        resetForm(materi.length + 2)
                    } else {
                        resetForm(materi.length + 2)
                        window.location.reload()
                    }
                }
                setIsUploading(false)
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
                setMateri((prev) => prev.map((m) => m.id === id ? { ...m, is_published: !current } : m))
                toast.success(!current ? 'Materi dipublish' : 'Materi disembunyikan')
            }
        })
    }

    const handleDelete = (id: string, title: string) => {
        if (!confirm(`Hapus materi "${title}"?`)) return
        startTransition(async () => {
            const result = await deleteMateri(id)
            if (result?.error) {
                toast.error(result.error)
            } else {
                setMateri((prev) => prev.filter((m) => m.id !== id))
                toast.success('Materi dihapus')
            }
        })
    }

    const isSubmitDisabled = isPending || isUploading
    const showUploadArea = form.material_type !== 'LINK'

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{materi.length} materi untuk <strong>{courseName}</strong></p>
                <Button size="sm" onClick={() => setShowForm((v) => !v)} variant={showForm ? 'outline' : 'default'}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Tambah Materi
                </Button>
            </div>

            {/* Form tambah */}
            {showForm && (
                <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/30">
                    <p className="text-sm font-semibold">Tambah Materi Baru</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-medium">Judul *</label>
                            <input
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                placeholder="Contoh: Pengenalan Interface Microsoft Word"
                            />
                        </div>
                        <div className="sm:col-span-2 space-y-1">
                            <label className="text-xs font-medium">Deskripsi</label>
                            <textarea
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background resize-none"
                                rows={2} value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Penjelasan singkat materi..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">Tipe Materi</label>
                            <select
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.material_type}
                                onChange={(e) => {
                                    const nextType = e.target.value as 'PDF' | 'VIDEO' | 'LINK' | 'OTHER'
                                    setForm((f) => ({ ...f, material_type: nextType }))
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
                            <input
                                type="number" min={1}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.order_index}
                                onChange={(e) => setForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 1 }))}
                            />
                        </div>
                        {showUploadArea && (
                            <div className="sm:col-span-2 space-y-2">
                                <label className="text-xs font-medium">Upload Dokumen / File Materi</label>
                                <div className="border border-dashed border-border rounded-xl p-4 bg-background/80">
                                    {selectedFile ? (
                                        <div className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                            <button
                                                type="button"
                                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted"
                                                onClick={() => {
                                                    setSelectedFile(null)
                                                    if (fileInputRef.current) fileInputRef.current.value = ''
                                                }}
                                                aria-label="Hapus file"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Pilih file dari komputer</p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    PDF, Word, Excel, PowerPoint, gambar, atau video singkat. Maksimal 50MB.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Pilih File
                                            </Button>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept={ACCEPT_MAP[form.material_type]}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleSelectFile(file)
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <label className="text-xs font-medium">
                                {showUploadArea ? 'URL File Cadangan (Opsional)' : 'URL File'}
                            </label>
                            <input
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.file_url} onChange={(e) => setForm((f) => ({ ...f, file_url: e.target.value }))}
                                placeholder={showUploadArea ? 'https://drive.google.com/...' : 'https://drive.google.com/...'}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium">URL Eksternal (YouTube, dll)</label>
                            <input
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
                                value={form.external_url} onChange={(e) => setForm((f) => ({ ...f, external_url: e.target.value }))}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={handleCreate} disabled={isSubmitDisabled}>
                            {isSubmitDisabled && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                            {isUploading ? 'Mengupload...' : 'Simpan'}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Batal</Button>
                    </div>
                </div>
            )}

            {/* List materi */}
            {materi.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                    Belum ada materi. Klik &quot;Tambah Materi&quot; untuk mulai.
                </div>
            ) : (
                <div className="space-y-2">
                    {materi.map((m) => (
                        <div key={m.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${m.is_published ? 'border-border/60 bg-background' : 'border-dashed border-muted-foreground/30 bg-muted/30'}`}>
                            <div className={`text-muted-foreground flex-shrink-0 ${m.is_published ? 'opacity-100' : 'opacity-40'}`}>
                                {TYPE_ICONS[m.material_type] ?? <File className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${!m.is_published ? 'text-muted-foreground' : ''}`}>{m.order_index}. {m.title}</span>
                                    {!m.is_published && <span className="text-xs text-muted-foreground/60">(Draft)</span>}
                                </div>
                                {m.description && <p className="text-xs text-muted-foreground truncate">{m.description}</p>}
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-8 h-8"
                                    onClick={() => handleToggle(m.id, m.is_published)}
                                    disabled={isPending}
                                    title={m.is_published ? 'Sembunyikan' : 'Publish'}
                                >
                                    {m.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="w-8 h-8 text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(m.id, m.title)}
                                    disabled={isPending}
                                    title="Hapus"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
