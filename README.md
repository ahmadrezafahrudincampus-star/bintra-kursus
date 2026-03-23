# Bintra Kursus

Aplikasi web kursus komputer berbasis Next.js dan Supabase untuk landing page, pendaftaran siswa, portal siswa, dan CMS/admin.

## Fitur Utama

- Landing page kursus komputer dengan UI modern
- Autentikasi login dan pendaftaran
- Form pendaftaran siswa
- Dashboard siswa untuk materi, iuran, jadwal, dan profil
- Admin/CMS untuk pendaftar, siswa, jadwal, materi, pengumuman, dan keuangan
- Integrasi Supabase Auth, Database, dan Storage

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Sonner
- Lucide React

## Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Environment

Buat file `.env.local` dan isi minimal:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Database

Jalankan migration SQL di folder [supabase/migrations](/supabase/migrations) ke project Supabase Anda:

- `00_init.sql`
- `01_announcements.sql`
- `01_storage_course_materials.sql`

## Super Admin Seed

Untuk membuat akun super admin default:

```bash
npm run seed:super-admin
```

Default credential:

- Email: `super_admin@kursus.com`
- Password: `admin123`

Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah valid sebelum menjalankan seed.
