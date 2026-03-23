'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { submitRegistration } from '@/lib/actions/registration'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

const regSchema = z.object({
    full_name: z.string().min(3, 'Nama minimal 3 karakter'),
    gender: z.enum(['L', 'P']),
    birth_date: z.string().min(1, 'Tanggal lahir wajib diisi'),
    phone: z.string().min(10, 'Nomor HP minimal 10 digit'),
    email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
    address: z.string().min(10, 'Alamat minimal 10 karakter'),
    school_name: z.string().min(3, 'Nama sekolah/instansi wajib diisi'),
    participant_category: z.enum(['SMP', 'SMA', 'Umum']),
    class_name: z.string().optional(),
    parent_name: z.string().optional(),
    parent_phone: z.string().optional(),
    course_id: z.string().min(1, 'Pilih program kursus'),
    preferred_session_id: z.string().optional(),
    experience: z.string().optional(),
    goals: z.string().optional(),
})

type RegFormData = z.infer<typeof regSchema>

interface Course { id: string; name: string; level: string }
interface Session {
    id: string; name: string; day_of_week: string
    start_time: string; end_time: string
    current_count: number; max_capacity: number
    course_id: string
}

export function RegistrationFormClient({
    courses,
    sessions,
}: {
    courses: Course[]
    sessions: Session[]
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<string>('')

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegFormData>({
        resolver: zodResolver(regSchema),
    })

    const category = watch('participant_category')

    const availableSessions = sessions.filter(
        (s) => s.course_id === selectedCourse && s.current_count < s.max_capacity
    )

    const onSubmit = async (data: RegFormData) => {
        setIsLoading(true)
        try {
            const result = await submitRegistration({
                ...data,
                email: data.email || undefined,
                class_name: data.class_name || undefined,
                parent_name: data.parent_name || undefined,
                parent_phone: data.parent_phone || undefined,
                preferred_session_id: data.preferred_session_id || undefined,
                experience: data.experience || undefined,
                goals: data.goals || undefined,
            })
            if (result?.error) {
                toast.error(result.error)
            }
        } catch {
            // redirect handled by server
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Data Pribadi */}
            <Card>
                <CardHeader><CardTitle className="text-base">Data Pribadi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Nama Lengkap *</Label>
                            <Input id="full_name" placeholder="Nama sesuai dokumen" {...register('full_name')} />
                            {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Kelamin *</Label>
                            <Select onValueChange={(v: string | null) => { if (v) setValue('gender', v as 'L' | 'P') }}>
                                <SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="L">Laki-laki</SelectItem>
                                    <SelectItem value="P">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.gender && <p className="text-xs text-destructive">Wajib dipilih</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Tanggal Lahir *</Label>
                            <Input id="birth_date" type="date" {...register('birth_date')} />
                            {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Nomor HP / WhatsApp *</Label>
                            <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" {...register('phone')} />
                            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Opsional)</Label>
                        <Input id="email" type="email" placeholder="nama@email.com" {...register('email')} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat Lengkap *</Label>
                        <Textarea id="address" placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..." rows={2} {...register('address')} />
                        {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Data Pendidikan */}
            <Card>
                <CardHeader><CardTitle className="text-base">Data Pendidikan / Instansi</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kategori Peserta *</Label>
                            <Select onValueChange={(v: string | null) => { if (v) setValue('participant_category', v as 'SMP' | 'SMA' | 'Umum') }}>
                                <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SMP">Pelajar SMP (Rp 15.000)</SelectItem>
                                    <SelectItem value="SMA">Pelajar SMA (Rp 20.000)</SelectItem>
                                    <SelectItem value="Umum">Umum / Luar Sekolah</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.participant_category && <p className="text-xs text-destructive">Wajib dipilih</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="school_name">Asal Sekolah / Instansi *</Label>
                            <Input id="school_name" placeholder="Nama sekolah atau instansi" {...register('school_name')} />
                            {errors.school_name && <p className="text-xs text-destructive">{errors.school_name.message}</p>}
                        </div>
                    </div>

                    {(category === 'SMP' || category === 'SMA') && (
                        <div className="space-y-2">
                            <Label htmlFor="class_name">Kelas</Label>
                            <Input id="class_name" placeholder="Contoh: VIII-A atau X IPA 2" {...register('class_name')} />
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="parent_name">Nama Orang Tua / Wali (Opsional)</Label>
                            <Input id="parent_name" placeholder="Nama wali" {...register('parent_name')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parent_phone">HP Orang Tua (Opsional)</Label>
                            <Input id="parent_phone" type="tel" placeholder="08xxxxxxxxxx" {...register('parent_phone')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pilihan Kursus & Sesi */}
            <Card>
                <CardHeader><CardTitle className="text-base">Program & Jadwal</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Program Kursus *</Label>
                        <Select onValueChange={(v: string | null) => {
                            if (v) {
                                setValue('course_id', v)
                                setSelectedCourse(v)
                                setValue('preferred_session_id', '')
                            }
                        }}>
                            <SelectTrigger><SelectValue placeholder="Pilih program yang diminati" /></SelectTrigger>
                            <SelectContent>
                                {courses.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.name} <span className="text-muted-foreground text-xs">({c.level})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.course_id && <p className="text-xs text-destructive">Pilih program kursus</p>}
                    </div>

                    {selectedCourse && (
                        <div className="space-y-2">
                            <Label>Pilihan Sesi / Jadwal</Label>
                            {availableSessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground border rounded-md p-3">
                                    Belum ada sesi tersedia untuk program ini. Admin akan menghubungi Anda untuk penjadwalan.
                                </p>
                            ) : (
                                <Select onValueChange={(v: string | null) => { if (v) setValue('preferred_session_id', v) }}>
                                    <SelectTrigger><SelectValue placeholder="Pilih jadwal (opsional)" /></SelectTrigger>
                                    <SelectContent>
                                        {availableSessions.map((s) => (
                                            <SelectItem key={s.id} value={s.id}>
                                                {s.name} — {s.day_of_week} {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                                                <span className="text-muted-foreground text-xs ml-1">
                                                    ({s.current_count}/{s.max_capacity} siswa)
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Informasi Tambahan */}
            <Card>
                <CardHeader><CardTitle className="text-base">Informasi Tambahan (Opsional)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="experience">Pengalaman Sebelumnya</Label>
                        <Textarea id="experience" placeholder="Ceritakan singkat pengalaman menggunakan komputer sebelumnya..." rows={2} {...register('experience')} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="goals">Tujuan Ikut Kursus</Label>
                        <Textarea id="goals" placeholder="Apa yang ingin Anda capai setelah mengikuti kursus ini?" rows={2} {...register('goals')} />
                    </div>
                </CardContent>
            </Card>

            <div className="bg-muted/50 border rounded-xl p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">📋 Catatan Penting</p>
                <ul className="space-y-1 list-disc list-inside">
                    <li>Formulir ini hanya dapat disubmit satu kali per akun.</li>
                    <li>Admin akan mereview dan menghubungi Anda dalam 1–2 hari kerja.</li>
                    <li>Pantau status pendaftaran Anda di Dashboard setelah submit.</li>
                </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengirim Pendaftaran...
                    </>
                ) : (
                    'Submit Pendaftaran'
                )}
            </Button>
        </form>
    )
}
