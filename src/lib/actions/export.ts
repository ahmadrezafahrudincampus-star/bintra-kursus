'use server'

import { createClient } from '../supabase/server'

interface ExportInvoiceRow {
    id: string
    invoice_number: string
    amount: number
    status: string
    period_month: number
    period_year: number
    created_at: string
    profiles: {
        full_name: string | null
        phone: string | null
    } | null
}

export async function exportInvoicesAsCSV(type: 'all' | 'unpaid' | 'verified') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return ''

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .returns<{ role: string }[]>()
        .single()

    if (profile?.role !== 'super_admin') return ''

    let query = supabase.from('invoices').select(`
        id, invoice_number, amount, status, period_month, period_year, created_at,
        profiles(full_name, phone)
    `).order('created_at', { ascending: false })

    if (type === 'unpaid') {
        query = query.in('status', ['UNPAID', 'OVERDUE'])
    } else if (type === 'verified') {
        query = query.eq('status', 'PAID')
    }

    const { data } = await query.returns<ExportInvoiceRow[]>()
    if (!data) return ''

    // Build CSV
    const rows: string[] = []
    rows.push('No. Invoice,Nama Siswa,No. HP,Periode,Nominal,Status,Tanggal Relevan')

    data.forEach((inv) => {
        const studentName = inv.profiles?.full_name ?? '-'
        const phone = inv.profiles?.phone ?? '-'
        const period = `${inv.period_month}/${inv.period_year}`
        const amount = inv.amount.toString()
        const status = inv.status
        const date = new Date(inv.created_at).toLocaleDateString('id-ID')

        const toCsv = (value: string) => `"${value.replace(/"/g, '""')}"`
        rows.push([
            toCsv(inv.invoice_number ?? '-'),
            toCsv(studentName),
            toCsv(phone),
            toCsv(period),
            toCsv(amount),
            toCsv(status),
            toCsv(date),
        ].join(','))
    })

    return rows.join('\n')
}
