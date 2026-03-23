'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface UploadInvoiceData {
    id: string
    amount: number
    period_month: number
    period_year: number
    status: string
}

export async function uploadPaymentProof(formData: {
    invoice_id: string
    file_url: string
    officer_name?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: invoice, error: invoiceErr } = await supabase
        .from('invoices')
        .select('id, amount, period_month, period_year, status')
        .eq('id', formData.invoice_id)
        .eq('profile_id', user.id)
        .returns<UploadInvoiceData[]>()
        .single()

    if (invoiceErr || !invoice) return { error: 'Invoice tidak ditemukan.' }
    if (!['UNPAID', 'OVERDUE'].includes(invoice.status)) {
        return { error: 'Invoice ini tidak dapat diunggah ulang saat ini.' }
    }

    // Simpan bukti pembayaran
    const { data: proof, error: proofErr } = await supabase
        .from('payment_proofs')
        .insert({
            invoice_id: formData.invoice_id,
            file_url: formData.file_url,
            period_month: invoice.period_month,
            period_year: invoice.period_year,
            amount: invoice.amount,
            officer_name: formData.officer_name,
            uploaded_by: user.id,
            status: 'PENDING',
        } as any)
        .select()
        .single()

    if (proofErr) return { error: proofErr.message }

    // Update status invoice ke PENDING_VERIFICATION
    const { error: invErr } = await supabase
        .from('invoices')
        .update({ status: 'PENDING_VERIFICATION', updated_at: new Date().toISOString() } as never)
        .eq('id', formData.invoice_id)

    if (invErr) return { error: invErr.message }

    await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: 'PAYMENT_PROOF_UPLOADED',
        target_type: 'payment_proofs',
        target_id: (proof as any).id,
        details: { invoice_id: formData.invoice_id, amount: invoice.amount },
    } as any)

    revalidatePath('/dashboard/iuran')
    revalidatePath('/dashboard/histori-iuran')
    revalidatePath('/admin/keuangan')
    return { success: true }
}

export async function verifyPaymentProof(
    proofId: string,
    invoiceId: string,
    action: 'VERIFIED' | 'REJECTED',
    adminNote?: string
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).returns<{ role: string }[]>().single()
    if (profile?.role !== 'super_admin') return { error: 'Unauthorized' }

    // Update status bukti
    const { error: proofErr } = await supabase
        .from('payment_proofs')
        .update({
            status: action,
            verified_by: user.id,
            verified_at: new Date().toISOString(),
            admin_note: adminNote,
        } as never)
        .eq('id', proofId)

    if (proofErr) return { error: proofErr.message }

    // Jika diverifikasi, update invoice ke PAID
    if (action === 'VERIFIED') {
        await supabase
            .from('invoices')
            .update({
                status: 'PAID',
                paid_at: new Date().toISOString(),
                verified_by: user.id,
                updated_at: new Date().toISOString(),
            } as never)
            .eq('id', invoiceId)
    } else {
        // Jika ditolak, kembalikan invoice ke UNPAID
        await supabase
            .from('invoices')
            .update({ status: 'UNPAID', updated_at: new Date().toISOString() } as never)
            .eq('id', invoiceId)
    }

    await supabase.from('activity_logs').insert({
        actor_id: user.id,
        action: action === 'VERIFIED' ? 'PAYMENT_VERIFIED' : 'PAYMENT_REJECTED',
        target_type: 'payment_proofs',
        target_id: proofId,
        details: { invoice_id: invoiceId, note: adminNote },
    } as any)

    revalidatePath('/admin/keuangan')
    revalidatePath('/dashboard/iuran')
    revalidatePath('/dashboard/histori-iuran')
    return { success: true }
}

export async function getMyInvoices() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('invoices')
        .select(`
      *,
      payment_proofs(id, file_url, status, created_at, admin_note)
    `)
        .eq('profile_id', user.id)
        .order('period_year', { ascending: false })
        .order('period_month', { ascending: false })

    return data ?? []
}
