import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=')
        return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)]
      })
  )
}

function createAnonClient(env) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function createServiceClient(env) {
  if (!env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    return null
  }

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function pad(number) {
  return number.toString().padStart(2, '0')
}

function buildDummyUser(batchTag, index) {
  const number = index + 1
  const participantCategory = ['SMP', 'SMA', 'Umum'][index % 3]

  return {
    email: `dummy.backend.${batchTag}.${pad(number)}@example.com`,
    password: 'DummyTest123!',
    full_name: `Dummy Backend ${pad(number)}`,
    phone: `08123${(100000 + number).toString()}`,
    participant_category: participantCategory,
    gender: index % 2 === 0 ? 'L' : 'P',
    birth_date: `200${index % 8 + 1}-0${(index % 8) + 1}-15`,
    address: `Jl. Dummy Backend No. ${number}, Kota Uji`,
    school_name:
      participantCategory === 'Umum'
        ? 'Peserta Umum'
        : participantCategory === 'SMP'
          ? `SMP Dummy ${pad(number)}`
          : `SMA Dummy ${pad(number)}`,
    class_name:
      participantCategory === 'Umum'
        ? null
        : participantCategory === 'SMP'
          ? `8-${(index % 3) + 1}`
          : `11-${(index % 3) + 1}`,
    parent_name: participantCategory === 'Umum' ? null : `Orang Tua Dummy ${pad(number)}`,
    parent_phone: participantCategory === 'Umum' ? null : `08211${(200000 + number).toString()}`,
    experience: 'Data dummy backend untuk pengujian alur pendaftaran.',
    goals: 'Memastikan flow login dan daftar berjalan untuk banyak akun.',
  }
}

async function main() {
  const envPath = path.join(process.cwd(), '.env.local')
  const env = loadEnv(envPath)
  const batchTag = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const serviceClient = createServiceClient(env)

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum tersedia di .env.local')
  }

  const bootstrapClient = createAnonClient(env)
  const { data: courses, error: courseError } = await bootstrapClient
    .from('course_master')
    .select('id, name')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (courseError) {
    throw new Error(`Gagal memuat course aktif: ${courseError.message}`)
  }

  if (!courses?.length) {
    throw new Error('Tidak ada course aktif yang bisa dipakai untuk dummy registration.')
  }

  const summary = []

  for (let index = 0; index < 10; index += 1) {
    const dummy = buildDummyUser(batchTag, index)
    const course = courses[index % courses.length]
    const client = createAnonClient(env)
    const elevatedClient = serviceClient ?? client

    let loginUser = null
    let signUpError = null

    if (serviceClient) {
      const { data, error } = await serviceClient.auth.admin.createUser({
        email: dummy.email,
        password: dummy.password,
        email_confirm: true,
        user_metadata: {
          full_name: dummy.full_name,
        },
      })

      signUpError = error
      loginUser = data?.user ?? null
    } else {
      const { data, error } = await client.auth.signUp({
        email: dummy.email,
        password: dummy.password,
        options: {
          data: {
            full_name: dummy.full_name,
          },
        },
      })

      signUpError = error
      loginUser = data.user ?? null
    }

    if (signUpError) {
      summary.push({
        email: dummy.email,
        stage: 'sign_up',
        success: false,
        message: signUpError.message,
      })
      continue
    }

    let loginError = null

    if (!serviceClient) {
      // Sign in explicitly so the registration insert runs with the same auth path as the app.
      const signInResult = await client.auth.signInWithPassword({
        email: dummy.email,
        password: dummy.password,
      })

      if (signInResult.error) {
        loginError = signInResult.error.message
      } else {
        loginUser = signInResult.data.user
      }
    }

    if (!loginUser) {
      summary.push({
        email: dummy.email,
        stage: 'sign_in',
        success: false,
        message: loginError ?? 'User tidak tersedia setelah sign up.',
      })
      continue
    }

    await elevatedClient.from('profiles').update({ phone: dummy.phone }).eq('id', loginUser.id)

    const registrationPayload = {
      profile_id: loginUser.id,
      full_name: dummy.full_name,
      gender: dummy.gender,
      birth_date: dummy.birth_date,
      phone: dummy.phone,
      email: dummy.email,
      address: dummy.address,
      school_name: dummy.school_name,
      participant_category: dummy.participant_category,
      class_name: dummy.class_name,
      parent_name: dummy.parent_name,
      parent_phone: dummy.parent_phone,
      course_id: course.id,
      preferred_session_id: null,
      experience: dummy.experience,
      goals: dummy.goals,
      status: 'PENDING',
    }

    const { data: registration, error: registrationError } = await elevatedClient
      .from('registrations')
      .insert(registrationPayload)
      .select('id, reg_number, status')
      .single()

    if (registrationError) {
      summary.push({
        email: dummy.email,
        stage: 'registration',
        success: false,
        message: registrationError.message,
      })
      continue
    }

    await elevatedClient.from('activity_logs').insert({
      actor_id: loginUser.id,
      action: 'DUMMY_REGISTRATION_SEEDED',
      target_type: 'registrations',
      target_id: registration.id,
      details: {
        batch_tag: batchTag,
        email: dummy.email,
        course_name: course.name,
      },
    })

    summary.push({
      email: dummy.email,
      stage: 'completed',
      success: true,
      reg_number: registration.reg_number,
      course_name: course.name,
    })
  }

  const successCount = summary.filter((item) => item.success).length
  const failed = summary.filter((item) => !item.success)

  console.log(JSON.stringify({
    batchTag,
    mode: serviceClient ? 'service_role' : 'public_signup',
    successCount,
    failedCount: failed.length,
    summary,
  }, null, 2))

  if (failed.length > 0) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
