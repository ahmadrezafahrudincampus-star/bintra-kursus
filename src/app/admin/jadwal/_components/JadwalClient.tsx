'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, User, Users, Search, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface SessionData {
    id: string
    name: string
    course_id: string
    course_name: string
    instructor_name: string
    room: string
    day_of_week: string
    start_time: string
    end_time: string
    max_capacity: number
    current_count: number
    is_active: boolean
}

export function JadwalClient({ initialSessions }: { initialSessions: SessionData[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterDay, setFilterDay] = useState<string>('all')
    const [filterStatus, setFilterStatus] = useState<string>('active')

    // Unique days and courses for filters
    const availableDays = Array.from(new Set(initialSessions.map(s => s.day_of_week)))

    const filtered = useMemo(() => {
        return initialSessions.filter((s) => {
            const matchSearch =
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.instructor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.course_name.toLowerCase().includes(searchQuery.toLowerCase())
            const matchDay = filterDay === 'all' || s.day_of_week === filterDay
            const matchStatus =
                filterStatus === 'all' ? true :
                    filterStatus === 'active' ? s.is_active : !s.is_active

            return matchSearch && matchDay && matchStatus
        })
    }, [initialSessions, searchQuery, filterDay, filterStatus])

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari sesi, instruktur, atau program..."
                        className="pl-9 h-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <Select value={filterDay} onValueChange={(val) => setFilterDay(val || 'all')}>
                        <SelectTrigger className="w-[140px] h-10 shrink-0">
                            <SelectValue placeholder="Pilih Hari" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Hari</SelectItem>
                            {availableDays.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
                        <SelectTrigger className="w-[130px] h-10 shrink-0">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((s) => {
                    const isFull = s.current_count >= s.max_capacity
                    return (
                        <Card key={s.id} className="transition-hover hover:shadow-md flex flex-col group">
                            <CardHeader className="pb-3 border-b border-border/40">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <CardTitle className="h5 leading-tight">{s.name}</CardTitle>
                                        <p className="caption text-muted-foreground mt-1 flex items-center">
                                            <BookOpen className="w-3 h-3 mr-1 opacity-70" />
                                            {s.course_name}
                                        </p>
                                    </div>
                                    <Badge variant={s.is_active ? 'default' : 'secondary'}>
                                        {s.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-1 flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="caption text-muted-foreground uppercase tracking-wider mb-0.5">Jadwal</p>
                                        <p className="font-medium flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-primary" />
                                            {s.day_of_week}, {s.start_time.substring(0, 5)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="caption text-muted-foreground uppercase tracking-wider mb-0.5">Ruangan</p>
                                        <p className="font-medium flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                            {s.room}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="caption text-muted-foreground uppercase tracking-wider mb-0.5">Instruktur</p>
                                        <p className="font-medium flex items-center gap-1.5 truncate" title={s.instructor_name}>
                                            <User className="w-3.5 h-3.5 text-blue-500" />
                                            {s.instructor_name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="caption text-muted-foreground uppercase tracking-wider mb-0.5">Kapasitas</p>
                                        <p className="font-medium flex items-center gap-1.5">
                                            <Users className={`w-3.5 h-3.5 ${isFull ? 'text-destructive' : 'text-green-500'}`} />
                                            <span className={isFull ? 'text-destructive' : ''}>
                                                {s.current_count} / {s.max_capacity}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 flex gap-2 w-full">
                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link href={`/admin/absensi?session=${s.id}`}>
                                            Isi Absen
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" size="sm" className="w-full" asChild>
                                        <Link href={`/admin/sesi?id=${s.id}`}>
                                            Detail Sesi
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {filtered.length === 0 && (
                    <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/80">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <h3 className="h5 mb-1">Jadwal tidak ditemukan</h3>
                        <p className="body-sm">Coba ubah kata kunci pencarian atau filter Anda.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
