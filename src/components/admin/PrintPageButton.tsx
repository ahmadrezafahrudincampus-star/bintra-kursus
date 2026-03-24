'use client'

import { Printer } from 'lucide-react'

type PrintPageButtonProps = {
    className?: string
}

export function PrintPageButton({ className }: PrintPageButtonProps) {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className={className}
        >
            <Printer className="w-4 h-4" />
            Cetak PDF
        </button>
    )
}
