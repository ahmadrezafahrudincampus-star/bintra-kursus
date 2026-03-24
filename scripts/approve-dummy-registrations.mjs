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
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = env.SUPER_ADMIN_EMAIL || 'super_admin@kursus.com'
const batchTag = env.DUMMY_BATCH_TAG || '20260323'
const approvalCount = Number.parseInt(env.DUMMY_APPROVAL_COUNT || '3', 10)

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL belum tersedia.')
}

if (!serviceRoleKey || serviceRoleKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diisi dengan key yang valid.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

function computeInvoiceAmount(course, category) {
  if (category === 'SMP') return course.price_smp
  if (category === 'SMA') return course.price_sma
  return course.price_umum
}

function buildDueDate() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 10))
    .toISOString()
    .slice(0, 10)
}

async function ensureSession(courseId, courseName, slotNumber) {
  const { data: existing, error: existingError } = await supabase
    .from('sessions')
    .select('id, name, current_count, max_capacity')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing) return existing

  const { data: created, error: createError } = await supabase
    .from('sessions')
    .insert({
      course_id: courseId,
      name: `Sesi Dummy ${slotNumber} - ${courseName}`,
      instructor_name: 'Instruktur Dummy',
      room: `Lab ${slotNumber}`,
      day_of_week: ['Senin', 'Selasa', 'Rabu'][slotNumber % 3],
      start_time: '09:00',
      end_time: '10:00',
      max_capacity: 15,
      is_active: true,
    })
    .select('id, name, current_count, max_capacity')
    .single()

  if (createError) throw createError
  return created
}

async function main() {
  const { data: adminUser, error: adminLookupError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })

  if (adminLookupError) throw adminLookupError

  const admin = adminUser.users.find((user) => user.email === adminEmail)
  if (!admin) {
    throw new Error(`Super admin ${adminEmail} tidak ditemukan.`)
  }

  const dummyEmails = Array.from({ length: 10 }, (_, index) => {
    const number = String(index + 1).padStart(2, '0')
    return `dummy.backend.${batchTag}.${number}@example.com`
  })

  const { data: registrations, error: regError } = await supabase
    .from('registrations')
    .select('id, profile_id, reg_number, course_id, participant_category, status, email, full_name')
    .in('email', dummyEmails)
    .order('reg_number', { ascending: true })

  if (regError) throw regError

  const pendingRegistrations = (registrations ?? [])
    .filter((registration) => registration.status === 'PENDING')
    .slice(0, approvalCount)

  if (!pendingRegistrations.length) {
    console.log(JSON.stringify({
      batchTag,
      approvedCount: 0,
      message: 'Tidak ada pendaftaran dummy berstatus PENDING yang siap di-approve.',
    }, null, 2))
    return
  }

  const courseIds = [...new Set(pendingRegistrations.map((item) => item.course_id))]
  const { data: courses, error: courseError } = await supabase
    .from('course_master')
    .select('id, name, price_smp, price_sma, price_umum')
    .in('id', courseIds)

  if (courseError) throw courseError

  const courseMap = new Map((courses ?? []).map((course) => [course.id, course]))
  const periodMonth = new Date().getMonth() + 1
  const periodYear = new Date().getFullYear()
  const dueDate = buildDueDate()
  const summary = []

  for (const [index, registration] of pendingRegistrations.entries()) {
    const course = courseMap.get(registration.course_id)
    if (!course) {
      summary.push({
        email: registration.email,
        success: false,
        message: 'Course untuk registration ini tidak ditemukan.',
      })
      continue
    }

    const session = await ensureSession(registration.course_id, course.name, index + 1)

    const { data: enrollment, error: enrollmentError } = await supabase
      .from('student_enrollments')
      .insert({
        profile_id: registration.profile_id,
        session_id: session.id,
        registration_id: registration.id,
        participant_category: registration.participant_category,
        status: 'ACTIVE',
      })
      .select('id')
      .single()

    if (enrollmentError) {
      summary.push({
        email: registration.email,
        success: false,
        message: enrollmentError.message,
      })
      continue
    }

    const amount = computeInvoiceAmount(course, registration.participant_category)

    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        profile_id: registration.profile_id,
        enrollment_id: enrollment.id,
        amount,
        period_month: periodMonth,
        period_year: periodYear,
        due_date: dueDate,
        status: 'UNPAID',
      })

    if (invoiceError) {
      summary.push({
        email: registration.email,
        success: false,
        message: invoiceError.message,
      })
      continue
    }

    const reviewedAt = new Date().toISOString()

    const { error: registrationUpdateError } = await supabase
      .from('registrations')
      .update({
        status: 'APPROVED',
        preferred_session_id: session.id,
        reviewed_by: admin.id,
        reviewed_at: reviewedAt,
      })
      .eq('id', registration.id)

    if (registrationUpdateError) {
      summary.push({
        email: registration.email,
        success: false,
        message: registrationUpdateError.message,
      })
      continue
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        role: 'student',
      })
      .eq('id', registration.profile_id)

    if (profileError) {
      summary.push({
        email: registration.email,
        success: false,
        message: profileError.message,
      })
      continue
    }

    await supabase.from('activity_logs').insert({
      actor_id: admin.id,
      action: 'DUMMY_REGISTRATION_APPROVED',
      target_type: 'registrations',
      target_id: registration.id,
      details: {
        batch_tag: batchTag,
        session_id: session.id,
        course_name: course.name,
        enrollment_id: enrollment.id,
      },
    })

    summary.push({
      email: registration.email,
      success: true,
      reg_number: registration.reg_number,
      session_name: session.name,
      amount,
    })
  }

  console.log(JSON.stringify({
    batchTag,
    approvedCount: summary.filter((item) => item.success).length,
    failedCount: summary.filter((item) => !item.success).length,
    summary,
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
