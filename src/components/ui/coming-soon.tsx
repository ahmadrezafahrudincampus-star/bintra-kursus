import { Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

interface ComingSoonProps {
    title: string
    description?: string
    backUrl?: string
    backLabel?: string
    meta?: Metadata
}

export function ComingSoon({
    title,
    description,
    backUrl = '#',
    backLabel = 'Kembali'
}: ComingSoonProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-2">
                <Construction className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground mt-2 mb-6">
                    {description ?? 'Fitur ini sedang dalam pengembangan aktif dan akan segera hadir!'}
                </p>
                {backUrl !== '#' && (
                    <Button variant="outline" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            {backLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    )
}
