'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintKartuIuranButton() {
    return (
        <Button
            onClick={() => window.print()}
            className="gap-2 no-print"
        >
            <Printer className="w-4 h-4" />
            Cetak Kartu
        </Button>
    )
}
