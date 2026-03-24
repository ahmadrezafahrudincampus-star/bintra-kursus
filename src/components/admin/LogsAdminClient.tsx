'use client'

import { useMemo, useState } from 'react'
import { Activity, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export type LogListItem = {
    id: string
    action: string
    target_type: string | null
    target_id: string | null
    created_at: string
    details: Record<string, unknown> | null
    actor_name: string | null
}

function formatAction(action: string) {
    return action
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function LogsAdminClient({ logs }: { logs: LogListItem[] }) {
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')

    const targetTypes = useMemo(
        () => Array.from(new Set(logs.map((log) => log.target_type).filter(Boolean))) as string[],
        [logs]
    )

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const query = searchQuery.trim().toLowerCase()
            const textBlob = [
                log.action,
                log.actor_name ?? '',
                log.target_type ?? '',
                log.target_id ?? '',
                JSON.stringify(log.details ?? {}),
            ]
                .join(' ')
                .toLowerCase()

            const matchesSearch = query.length === 0 || textBlob.includes(query)
            const matchesType = typeFilter === 'all' || log.target_type === typeFilter
            return matchesSearch && matchesType
        })
    }, [logs, searchQuery, typeFilter])

    return (
        <div className="space-y-4">
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Cari action, actor, target, atau detail log..."
                            className="pl-9"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant={typeFilter === 'all' ? 'default' : 'outline'} onClick={() => setTypeFilter('all')}>
                            Semua Target
                        </Button>
                        {targetTypes.map((type) => (
                            <Button key={type} type="button" size="sm" variant={typeFilter === type ? 'default' : 'outline'} onClick={() => setTypeFilter(type)}>
                                {type}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {filteredLogs.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Activity className="mx-auto mb-3 h-10 w-10 opacity-20" />
                        <p className="font-medium">Tidak ada log yang cocok dengan filter.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredLogs.map((log) => (
                        <div key={log.id} className="space-y-3 rounded-2xl border border-border/60 bg-card p-4">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-base font-semibold">{formatAction(log.action)}</h2>
                                        {log.target_type ? <Badge variant="outline">{log.target_type}</Badge> : null}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Oleh {log.actor_name ?? 'Sistem'} pada{' '}
                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                {log.target_id ? (
                                    <Badge variant="secondary" className="max-w-full truncate">
                                        Target: {log.target_id.slice(0, 8)}
                                    </Badge>
                                ) : null}
                            </div>

                            {log.details ? (
                                <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl border border-border/50 bg-muted/30 p-3 text-xs">
                                    {JSON.stringify(log.details, null, 2)}
                                </pre>
                            ) : null}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
