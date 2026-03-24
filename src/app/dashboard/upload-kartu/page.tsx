'use client'

import { useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { uploadPaymentProof } from '@/lib/actions/payment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Camera, Loader2, Image as ImageIcon, X } from 'lucide-react'

export default function UploadKartuPage() {
    const searchParams = useSearchParams()
    const invoiceId = searchParams.get('invoice_id') ?? ''
    const [preview, setPreview] = useState<string | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [officerName, setOfficerName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const cameraInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file maksimal 5MB')
            return
        }
        if (!file.type.startsWith('image/')) {
            toast.error('File harus berupa gambar (JPG, PNG, dll.)')
            return
        }
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    const handleSubmit = async () => {
        if (!selectedFile) { toast.error('Pilih foto bukti pembayaran terlebih dahulu'); return }
        if (!invoiceId) { toast.error('ID tagihan tidak ditemukan. Kembali ke halaman Iuran.'); return }

        setIsLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error('Silakan login ulang'); return }

            // Upload ke Supabase Storage
            const ext = selectedFile.name.split('.').pop()
            const path = `payment-proofs/${user.id}/${invoiceId}-${Date.now()}.${ext}`
            const { error: uploadErr } = await supabase.storage
                .from('payment-proofs')
                .upload(path, selectedFile, { contentType: selectedFile.type, upsert: false })

            if (uploadErr) throw uploadErr

            const { data: { publicUrl } } = supabase.storage.from('payment-proofs').getPublicUrl(path)

            // Simpan ke DB
            const result = await uploadPaymentProof({
                invoice_id: invoiceId,
                file_url: publicUrl,
                officer_name: officerName || undefined,
            })

            if (result.error) throw new Error(result.error)

            toast.success('Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.')
            setPreview(null)
            setSelectedFile(null)
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat upload.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-xl">
            <div>
                <h1 className="text-2xl font-bold">Upload Bukti Pembayaran</h1>
                <p className="text-muted-foreground mt-1">
                    Foto kartu iuran fisik yang sudah ditandatangani admin/petugas.
                </p>
            </div>

            {!invoiceId && (
                <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4 text-sm text-orange-700">
                        ⚠ Tidak ada ID tagihan yang dipilih. Silakan kembali ke halaman <a href="/dashboard/iuran" className="underline font-medium">Iuran</a> dan klik tombol Upload Bukti pada tagihan yang ingin dibayarkan.
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle className="text-base">Foto Bukti Pembayaran</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {/* Preview */}
                    {preview ? (
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={preview} alt="Preview" className="w-full rounded-xl border border-border object-cover max-h-80" />
                            <button
                                onClick={() => { setPreview(null); setSelectedFile(null) }}
                                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 border border-border flex items-center justify-center hover:bg-muted transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-border/60 rounded-xl p-8 text-center space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Pilih atau ambil foto</p>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG · Maks. 5MB</p>
                            </div>

                            <div className="flex gap-2 justify-center">
                                {/* Gallery upload */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Pilih File
                                </Button>
                                {/* Native camera capture */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => cameraInputRef.current?.click()}
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Ambil Foto
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Hidden inputs */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
                    />
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
                    />

                    {/* Officer name */}
                    <div className="space-y-2">
                        <Label htmlFor="officer_name">Nama Petugas Penerima (Opsional)</Label>
                        <Input
                            id="officer_name"
                            placeholder="Nama admin/petugas yang menandatangani"
                            value={officerName}
                            onChange={(e) => setOfficerName(e.target.value)}
                        />
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">Tips foto yang baik:</p>
                        <p>- Foto dengan pencahayaan yang cukup, hindari bayangan</p>
                        <p>- Pastikan tulisan dan tanda tangan terlihat jelas</p>
                        <p>- Foto seluruh kartu/kuitansi, tidak terpotong</p>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={!selectedFile || isLoading || !invoiceId}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengupload...</>
                        ) : (
                            <><Upload className="w-4 h-4 mr-2" /> Submit Bukti Pembayaran</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
