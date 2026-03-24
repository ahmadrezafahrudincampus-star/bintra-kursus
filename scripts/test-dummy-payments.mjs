import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(filePath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        return [line.slice(0, index), line.slice(index + 1)]
      })
  )
}

const env = {
  ...loadEnvFile('.env.local'),
  ...process.env,
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const batchTag = env.DUMMY_BATCH_TAG || '20260323'
const sharedPassword = env.DUMMY_PASSWORD || 'DummyTest123!'
const adminEmail = env.SUPER_ADMIN_EMAIL || 'super_admin@kursus.com'
const adminPassword = env.SUPER_ADMIN_PASSWORD || 'admin123'

if (!supabaseUrl || !anonKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum tersedia.')
}

function createAnonClient() {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function uploadProofAsStudent(email, invoiceId, suffix) {
  const client = createAnonClient()
  const { data: authData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password: sharedPassword,
  })

  if (signInError || !authData.user) {
    throw new Error(`Gagal login student ${email}: ${signInError?.message ?? 'unknown error'}`)
  }

  const proofUrl = `https://example.com/payment-proofs/${batchTag}/${suffix}.jpg`

  const { data: invoice, error: invoiceError } = await client
    .from('invoices')
    .select('id, amount, period_month, period_year, status')
    .eq('id', invoiceId)
    .eq('profile_id', authData.user.id)
    .single()

  if (invoiceError || !invoice) {
    throw new Error(`Invoice ${invoiceId} tidak ditemukan untuk ${email}: ${invoiceError?.message ?? 'unknown error'}`)
  }

  if (!['UNPAID', 'OVERDUE'].includes(invoice.status)) {
    throw new Error(`Invoice ${invoiceId} untuk ${email} tidak bisa diupload, status sekarang ${invoice.status}`)
  }

  const { data: proof, error: proofError } = await client
    .from('payment_proofs')
    .insert({
      invoice_id: invoice.id,
      file_url: proofUrl,
      period_month: invoice.period_month,
      period_year: invoice.period_year,
      amount: invoice.amount,
      officer_name: `Petugas Dummy ${suffix}`,
      uploaded_by: authData.user.id,
      status: 'PENDING',
    })
    .select('id')
    .single()

  if (proofError || !proof) {
    throw new Error(`Gagal insert payment proof untuk ${email}: ${proofError?.message ?? 'unknown error'}`)
  }

  const { error: invoiceUpdateError } = await client
    .from('invoices')
    .update({
      status: 'PENDING_VERIFICATION',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoice.id)

  if (invoiceUpdateError) {
    throw new Error(`Gagal update invoice ke PENDING_VERIFICATION untuk ${email}: ${invoiceUpdateError.message}`)
  }

  await client.from('activity_logs').insert({
    actor_id: authData.user.id,
    action: 'PAYMENT_PROOF_UPLOADED_TEST',
    target_type: 'payment_proofs',
    target_id: proof.id,
    details: { invoice_id: invoice.id, amount: invoice.amount, batch_tag: batchTag },
  })

  return {
    userId: authData.user.id,
    invoiceId: invoice.id,
    proofId: proof.id,
    amount: invoice.amount,
    proofUrl,
  }
}

async function verifyProofAsAdmin(proofId, invoiceId, action, adminNote) {
  const client = createAnonClient()
  const { data: authData, error: signInError } = await client.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  })

  if (signInError || !authData.user) {
    throw new Error(`Gagal login super admin: ${signInError?.message ?? 'unknown error'}`)
  }

  const { error: proofError } = await client
    .from('payment_proofs')
    .update({
      status: action,
      verified_by: authData.user.id,
      verified_at: new Date().toISOString(),
      admin_note: adminNote,
    })
    .eq('id', proofId)

  if (proofError) {
    throw new Error(`Gagal update payment proof ${proofId}: ${proofError.message}`)
  }

  const nextInvoiceState =
    action === 'VERIFIED'
      ? {
          status: 'PAID',
          paid_at: new Date().toISOString(),
          verified_by: authData.user.id,
          updated_at: new Date().toISOString(),
        }
      : {
          status: 'UNPAID',
          updated_at: new Date().toISOString(),
        }

  const { error: invoiceError } = await client
    .from('invoices')
    .update(nextInvoiceState)
    .eq('id', invoiceId)

  if (invoiceError) {
    throw new Error(`Gagal update invoice ${invoiceId}: ${invoiceError.message}`)
  }

  await client.from('activity_logs').insert({
    actor_id: authData.user.id,
    action: action === 'VERIFIED' ? 'PAYMENT_VERIFIED_TEST' : 'PAYMENT_REJECTED_TEST',
    target_type: 'payment_proofs',
    target_id: proofId,
    details: { invoice_id: invoiceId, note: adminNote, batch_tag: batchTag },
  })
}

async function main() {
  const serviceClient = createClient(supabaseUrl, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const emails = [
    `dummy.backend.${batchTag}.01@example.com`,
    `dummy.backend.${batchTag}.02@example.com`,
    `dummy.backend.${batchTag}.03@example.com`,
  ]

  const { data: registrationRows, error: regError } = await serviceClient
    .from('registrations')
    .select('profile_id, email')
    .in('email', emails)

  if (regError) throw regError

  const profileIds = (registrationRows ?? []).map((row) => row.profile_id)

  const { data: invoices, error: invoiceError } = await serviceClient
    .from('invoices')
    .select('id, profile_id, invoice_number, status')
    .in('profile_id', profileIds)
    .order('created_at', { ascending: true })

  if (invoiceError) throw invoiceError

  const invoicesByEmail = emails.map((email) => {
    const registration = registrationRows?.find((row) => row.email === email)
    const invoice = invoices?.find((row) => row.profile_id === registration?.profile_id)
    return { email, invoice }
  })

  const actions = [
    { action: 'VERIFIED', note: 'Bukti valid dan sesuai transfer.' },
    { action: 'REJECTED', note: 'Bukti kurang jelas untuk verifikasi awal.' },
    { action: 'VERIFIED', note: 'Bukti valid dan diterima admin.' },
  ]

  const summary = []

  for (let index = 0; index < invoicesByEmail.length; index += 1) {
    const item = invoicesByEmail[index]
    const decision = actions[index]

    if (!item.invoice) {
      summary.push({
        email: item.email,
        success: false,
        message: 'Invoice tidak ditemukan untuk user ini.',
      })
      continue
    }

    const uploaded = await uploadProofAsStudent(item.email, item.invoice.id, `proof-${index + 1}`)
    await verifyProofAsAdmin(uploaded.proofId, uploaded.invoiceId, decision.action, decision.note)

    const { data: finalInvoice } = await serviceClient
      .from('invoices')
      .select('status, paid_at')
      .eq('id', uploaded.invoiceId)
      .single()

    const { data: finalProof } = await serviceClient
      .from('payment_proofs')
      .select('status, admin_note')
      .eq('id', uploaded.proofId)
      .single()

    summary.push({
      email: item.email,
      success: true,
      invoiceStatus: finalInvoice?.status ?? null,
      proofStatus: finalProof?.status ?? null,
      adminNote: finalProof?.admin_note ?? null,
    })
  }

  console.log(
    JSON.stringify(
      {
        batchTag,
        testedCount: summary.filter((item) => item.success).length,
        failedCount: summary.filter((item) => !item.success).length,
        summary,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
