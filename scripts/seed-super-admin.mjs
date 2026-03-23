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

const envFromFile = loadEnvFile('.env.local')
const env = {
  ...envFromFile,
  ...process.env,
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
const adminEmail = env.SUPER_ADMIN_EMAIL || 'super_admin@kursus.com'
const adminPassword = env.SUPER_ADMIN_PASSWORD || 'admin123'
const adminFullName = env.SUPER_ADMIN_FULL_NAME || 'Super Admin'

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

async function findUserByEmail(email) {
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    })

    if (error) throw error

    const found = data.users.find((user) => user.email === email)
    if (found) return found

    if (data.users.length < 200) return null
    page += 1
  }
}

async function ensureSuperAdmin() {
  let user = await findUserByEmail(adminEmail)

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminFullName,
      },
    })

    if (error) throw error
    user = data.user
    console.log(`Auth user dibuat: ${adminEmail}`)
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata || {}),
        full_name: adminFullName,
      },
    })

    if (error) throw error
    console.log(`Auth user diperbarui: ${adminEmail}`)
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: adminFullName,
      role: 'super_admin',
    })
    .eq('id', user.id)

  if (profileError) throw profileError

  console.log('Profile di-set sebagai super_admin.')
  console.log(`Email: ${adminEmail}`)
  console.log(`Password: ${adminPassword}`)
}

ensureSuperAdmin().catch((error) => {
  console.error('Gagal seed super admin.')
  console.error(error.message || error)
  process.exitCode = 1
})
