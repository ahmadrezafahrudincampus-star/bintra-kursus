# 📘 DOKUMENTASI TEKNIS BINTRA KURSUS
## Panduan Admin Sistem Manajemen Kursus Komputer

**Versi:** 1.0  
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase · Tailwind CSS + shadcn/ui  
**Database:** PostgreSQL via Supabase (Auth, RLS, Triggers)

---

## 1. ALUR LENGKAP SISTEM

### 1.1 Siklus Hidup User

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌─────────────┐     ┌───────────┐
│   SIGN UP   │────▶│   DAFTAR     │────▶│   REVIEW      │────▶│   ACTIVE    │────▶│   PAY     │
│  (Applicant)│     │  (PENDING)   │     │  (Admin)      │     │  (Student)  │     │  (Invoice)│
└─────────────┘     └──────────────┘     └───────────────┘     └─────────────┘     └───────────┘
```

### 1.2 Langkah Detail

#### LANGKAH 1: Registrasi Akun
- **Halaman:** `/register`
- **Field:** email, password, full_name, phone
- **Tabel DB:** `auth.users` (auto via Supabase Auth)
- **Aksi:** Trigger `handle_new_user()` → membuat record di `profiles` dengan role = `'applicant'`
- **Redirect:** → `/dashboard`

#### LANGKAH 2: Pengajuan Pendaftaran
- **Halaman:** `/daftar`
- **Field Form:**
  | Field | Required | Tabel |
  |-------|----------|-------|
  | full_name | ✅ | registrations.full_name |
  | gender (L/P) | ✅ | registrations.gender |
  | birth_date | ✅ | registrations.birth_date |
  | phone | ✅ | registrations.phone |
  | email | ❌ | registrations.email |
  | address | ✅ | registrations.address |
  | school_name | ✅ | registrations.school_name |
  | participant_category (SMP/SMA/Umum) | ✅ | registrations.participant_category |
  | class_name | ❌ | registrations.class_name |
  | parent_name | ❌ | registrations.parent_name |
  | parent_phone | ❌ | registrations.parent_phone |
  | course_id | ✅ | registrations.course_id (FK ke course_master) |
  | preferred_session_id | ❌ | registrations.preferred_session_id (FK ke sessions) |
  | experience | ❌ | registrations.experience |
  | goals | ❌ | registrations.goals |
- **Tabel DB:** `registrations`
- **Status Awal:** `PENDING`
- **Reg Number:** Auto-generate oleh trigger `trg_generate_reg_number` → format: `REG-YYYY-NNNNN`
- **Validasi:** Cek apakah sudah ada pendaftaran aktif (selain REJECTED)

#### LANGKAH 3: Review Admin
- **Halaman:** `/admin/pendaftar`
- **Aksi Admin:**
  - **Setujui:** Pilih sesi → buat enrollment → ubah role ke `'student'` → generate invoice pertama
  - **Tolak:** Isi alasan → update status ke `'REJECTED'`
- **Tabel DB:** `registrations`, `student_enrollments`, `profiles`, `invoices`

#### LANGKAH 4: Siswa Aktif
- **Redirect:** User dengan role `'student'` otomatis ke `/dashboard`
- **Akses:** Dapat melihat jadwal, materi, absensi, iuran

#### LANGKAH 5: Pembayaran Iuran
- **Halaman Siswa:** `/dashboard/iuran`, `/dashboard/upload-kartu`
- **Halaman Admin:** `/admin/keuangan`
- **Flow:**
  1. Invoice dibuat otomatis saat approve → status `UNPAID`
  2. Siswa upload bukti bayar → status `PENDING_VERIFICATION`
  3. Admin verifikasi → status `PAID` atau `REJECTED` + catatan

### 1.3 Diagram Entitas Relasi

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│  profiles   │     │registrations│     │   sessions    │
├─────────────┤     ├──────────────┤     ├───────────────┤
│ id (PK)    │────▶│ profile_id   │     │ id (PK)       │
│ role       │     │ course_id(FK)│◀────│ course_id     │
│ full_name  │     │ session_id(FK)│◀───┤               │
└─────────────┘     └──────────────┘     └───────────────┘
       │                   │
       │                   ▼
       │            ┌───────────────┐
       │            │student_enroll │
       │            ├───────────────┤
       │            │ profile_id   │
       │            │ session_id   │
       │            │ status      │
       │            └───────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌───────────────┐     ┌───────────────┐
│  invoices   │◀────│enrollment_id │     │ course_master │
├─────────────┤     └───────────────┘     ├───────────────┤
│ id (PK)    │                             │ id (PK)       │
│ profile_id │     ┌───────────────┐        │ name          │
│ amount     │     │payment_proofs│        │ price_smp/sma │
└─────────────┘     ├───────────────┤        └───────────────┘
                    │ invoice_id   │
                    │ file_url     │
                    │ status       │
                    └───────────────┘

┌─────────────┐     ┌───────────────┐
│ attendances │     │course_materials│
├─────────────┤     ├───────────────┤
│ enrollment_id│    │ course_id     │
│ session_id  │     │ file_url      │
│ status      │     │ is_published  │
└─────────────┘     └───────────────┘
```

---

## 2. PANDUAN TIAP HALAMAN ADMIN

### 2.1 `/admin` — Dashboard Overview

**Fungsi:** Halaman utama admin menampilkan ringkasan sistem.

**Data yang Ditampilkan:**
- Total siswa aktif (role = `'student'`) → tabel `profiles`
- Pendaftar menunggu review (status = `'PENDING'`) → tabel `registrations`
- Pemasukan bulan ini (status = `'PAID'`) → tabel `invoices`
- Total tunggakan (status = `'UNPAID'` atau `'OVERDUE'`) → tabel `invoices`
- Ringkasan absensi bulan berjalan → tabel `attendances`
- Recent activity feed → tabel `activity_logs`, `registrations`, `payment_proofs`, `attendances`

**Aksi:** Klik card → navigasi ke halaman detail masing-masing.

**Catatan:**Jika ada pendaftar PENDING, card "Menunggu Review" menampilkan alert border kuning.

---

### 2.2 `/admin/pendaftar` — Kelola Pendaftar

**Fungsi:** Review dan kelola pendaftaran calon siswa.

**Data dari Tabel:**
```
registrations
├── full_name, phone, email, address
├── school_name, participant_category, class_name
├── parent_name, parent_phone
├── course_master (JOIN)
├── sessions (preferred_session JOIN)
├── status (PENDING/APPROVED/REJECTED/DRAFT)
├── rejection_reason, reviewed_by, reviewed_at
└── reg_number (auto-generate)
```

**Aksi:**

#### Setujui Pendaftaran
1. Pilih sesi kelas (harus sesuai dengan program yang dipilih)
2. Klik "Setujui & Aktifkan"
3. **Efek Database:**
   - `registrations.status` → `'APPROVED'`
   - `registrations.reviewed_by` → admin_id
   - `registrations.reviewed_at` → timestamp
   - `profiles.role` → `'student'`
   - Insert ke `student_enrollments` dengan `status = 'ACTIVE'`
   - Insert ke `invoices` dengan `status = 'UNPAID'` (bulan berjalan, harga sesuai kategori)
   - Trigger `trg_update_session_count` auto-increment `sessions.current_count`
   - Insert ke `activity_logs`

#### Tolak Pendaftaran
1. Isi alasan penolakan (wajib)
2. Klik "Tolak Pendaftaran"
3. **Efek Database:**
   - `registrations.status` → `'REJECTED'`
   - `registrations.rejection_reason` → alasan
   - `registrations.reviewed_by` → admin_id
   - `registrations.reviewed_at` → timestamp
   - Insert ke `activity_logs`

**Validasi:**
- Jika tidak ada sesi tersedia untuk program tersebut → tampilkan warning
- Sesi penuh (current_count >= max_capacity) → disabled di dropdown

---

### 2.3 `/admin/siswa` — Kelola Siswa

**Fungsi:** Lihat daftar semua siswa aktif.

**Data dari Tabel:**
```
student_enrollments
├── profiles (full_name, phone)
├── sessions (name, day_of_week, start_time, end_time)
├── course_master (name)
└── participant_category

invoices
└── status (untuk cek tunggakan)
```

**Aksi:** Hanya read-only (tampilan list).

**Indikator:**
- Icon CreditCard hijau → semua iuran lunas
- Icon AlertCircle oranye + angka → ada tagihan aktif
- Badge kategori (SMP/SMA/Umum)

---

### 2.4 `/admin/sesi` — Daftar Sesi Kelas

**Fungsi:** Lihat semua sesi kelas beserta kapasitas.

**Data dari Tabel:**
```
sessions
├── course_master (name, level)
├── day_of_week, start_time, end_time
├── room, instructor_name
├── max_capacity, current_count
└── is_active
```

**Tampilan:**
- Urutan default: Senin → Minggu, lalu jam mulai
- Progress bar keterisian kapasitas
- Badge "Aktif" / "Nonaktif"

**Aksi:** Klik "Detail Sesi" → navigasi ke `/admin/sesi?id=xxx` (halaman detail sesi, lihat code untuk aksi edit/delete).

---

### 2.5 `/admin/jadwal` — Manajemen Jadwal

**Fungsi:** Pantau dan kelola jadwal kelas dengan filter.

**Fitur:**
- Filter by nama sesi, instruktur, program
- Filter by hari
- Filter by status (Aktif/Nonaktif)
- Quick action: "Isi Absen" → `/admin/absensi?session=xxx`

**Catatan:** Halaman ini fokus pada VIEW dan navigasi. Aksi edit/delete sesi ada di `/admin/sesi`.

---

### 2.6 `/admin/absensi` — Input Absensi

**Fungsi:** Catat kehadiran siswa per sesi, tanggal, dan pertemuan.

**Data dari Tabel:**
```
sessions
├── student_enrollments
│   └── profiles (full_name)
└── attendances (untuk riwayat)
```

**Aksi:**
1. Pilih sesi, tanggal, nomor pertemuan
2. Klik siswa → pilih status (Hadir/Absen/Sakit/Izin)
3. Default semua siswa = Hadir
4. Klik "Simpan Absensi"

**Efek Database:**
- `attendances` → upsert (UNIQUE: enrollment_id + date + meeting_number)
- `attendances.recorded_by` → admin_id
- `attendances.status` → PRESENT/ABSENT/SICK/PERMIT

**Fitur:** Jika sudah ada data absensi untuk pertemuan tersebut, langsung di-load untuk diedit.

---

### 2.7 `/admin/absensi/rekap` — Rekap Absensi

**Fungsi:** Lihat akumulasi kehadiran siswa per sesi.

**Data yang Dihitung:**
- Total pertemuan yang diinput
- Total Hadir (PRESENT)
- Total Sakit (SICK) / Izin (PERMIT)
- Total Alpha (ABSENT)
- Persentase kehadiran

**Indikator Warna:**
- ≥80% → hijau
- 60-79% → kuning
- <60% → merah

---

### 2.8 `/admin/keuangan` — Rekap Keuangan

**Fungsi:** Pantau pemasukan, tunggakan, dan verifikasi bukti bayar.

**Data dari Tabel:**
```
invoices
├── amount, status
├── period_year, period_month
└── profiles (full_name)

payment_proofs
├── file_url, amount
├── officer_name (nama petugas CSO)
├── status (PENDING/VERIFIED/REJECTED)
└── verified_by, verified_at
```

**Filter:** Pilih periode (bulan/tahun)

**Stats:**
- Pemasukan bulan ini (sum amount where status = `'PAID'`)
- Tunggakan bulan ini (sum amount where status = `'UNPAID'`/`'OVERDUE'`)
- Bukti bayar menunggu verifikasi (count where status = `'PENDING'`)

**Aksi Verifikasi:**

#### Terima
1. Klik tombol "Terima" pada bukti bayar
2. **Efek Database:**
   - `payment_proofs.status` → `'VERIFIED'`
   - `payment_proofs.verified_by` → admin_id
   - `payment_proofs.verified_at` → timestamp
   - `invoices.status` → `'PAID'`
   - `invoices.paid_at` → timestamp
   - `invoices.verified_by` → admin_id
   - Insert ke `activity_logs`

#### Tolak
1. Klik tombol "Tolak"
2. **Efek Database:**
   - `payment_proofs.status` → `'REJECTED'`
   - `payment_proofs.admin_note` → 'Bukti kurang jelas'
   - `payment_proofs.verified_by` → admin_id
   - `payment_proofs.verified_at` → timestamp
   - `invoices.status` → `'UNPAID'`
   - Insert ke `activity_logs`

---

### 2.9 `/admin/pengumuman` — Kelola Pengumuman

**Fungsi:** Buat dan kelola pengumuman untuk siswa.

**Data dari Tabel:**
```
announcements
├── title, content
├── target_session_id (nullable)
├── is_active
└── created_by, created_at
```

**Aksi:**
- **Buat:** Isi judul, konten, pilih sesi target (opsional)
- **Toggle:** Aktif/nonaktifkan pengumuman
- **Hapus:** Hapus pengumuman

**Target Session:** Jika diisi, pengumuman hanya terlihat oleh siswa di sesi tersebut (via RLS policy).

---

### 2.10 `/admin/materi` — Kelola Materi

**Fungsi:** Upload dan publish materi pembelajaran.

**Data dari Tabel:**
```
course_materials
├── course_id (FK)
├── title, description
├── file_url (upload ke Supabase Storage bucket: `course-materials`)
├── external_url
├── material_type (PDF/VIDEO/LINK/OTHER)
├── order_index
├── is_published
└── created_at
```

**Aksi:**
- **Tambah:** Upload file atau masukkan link eksternal
- **Toggle Publish:** Publish/unpublish materi
- **Hapus:** Hapus materi + file dari storage

**Catatan:** Materi hanya bisa di-download oleh siswa yang TERDAFTAR di sesi terkait (via RLS policy `course_materials`).

---

### 2.11 `/admin/kartu-iuran` — Cetak Kartu Iuran

**Fungsi:** Generate dan cetak kartu iuran resmi untuk siswa.

**Flow:**
1. Pilih sesi kelas
2. Pilih nama siswa
3. Tampilkan kartu iuran dengan semua invoice

**Kartu Include:**
- Info siswa (nama, HP, kelas, jadwal)
- Tabel invoice: bulan, nominal, status (LUNAS/BELUM BAYAR/PENDING/JATUH TEMPO)
- Tombol Print → `window.print()`

**Styling:** CSS `@media print` untuk hasil cetak rapi (A4).

---

### 2.12 `/admin/template-absen` — Template Absensi Cetak

**Fungsi:** Generate template daftar hadir kosong untuk diisi manual.

**Konfigurasi:**
- Pilih sesi kelas
- Pilih bulan
- Tentukan maksimal pertemuan (default: 5)

**Output:** Tabel dengan kolom:
- No
- Nama Lengkap
- Tingkat
- 5 kolom tanggal pertemuan (kosong)
- Keterangan

**Catatan:** Include baris kosong untuk siswa susulan.

---

### 2.13 `/admin/user` — Kelola User

**Fungsi:** Lihat semua profil pengguna (admin, pendaftar, siswa).

**Data dari Tabel:**
```
profiles
├── full_name, phone, role
├── registrations (count)
├── student_enrollments (count active)
└── created_at
```

**Role Badges:**
- Super Admin → badge default
- Pendaftar → badge secondary
- Siswa → badge outline

---

### 2.14 `/admin/export` — Export Laporan

**Fungsi:** Export data invoice ke CSV.

**Pilihan Export:**
1. **Semua Tagihan** → semua invoice
2. **Daftar Tunggakan** → invoice dengan status `UNPAID`/`OVERDUE`
3. **Pembayaran Selesai** → invoice dengan status `PAID`

**CSV Columns:**
```
No. Invoice, Nama Siswa, No. HP, Periode, Nominal, Status, Tanggal Relevan
```

---

### 2.15 `/admin/logs` — Log Aktivitas

**Fungsi:** Audit trail untuk semua aksi penting.

**Data dari Tabel:**
```
activity_logs
├── actor_id (dari profiles)
├── action (REGISTRATION_SUBMITTED, REGISTRATION_APPROVED, dll)
├── target_type, target_id
├── details (JSON)
└── created_at
```

**Actions yang Di-log:**
| Action | Trigger |
|--------|---------|
| REGISTRATION_SUBMITTED | Siswa submit form pendaftaran |
| REGISTRATION_APPROVED | Admin setujui pendaftaran |
| REGISTRATION_REJECTED | Admin tolak pendaftaran |
| PAYMENT_PROOF_UPLOADED | Siswa upload bukti bayar |
| PAYMENT_VERIFIED | Admin terima bukti bayar |
| PAYMENT_REJECTED | Admin tolak bukti bayar |

---

### 2.16 `/admin/pengaturan` — Pengaturan

**Fungsi:** Info sistem dan status integrasi.

**Tampilan:**
- Profil admin aktif (nama, role, email login)
- Status integrasi Supabase (URL, Anon Key, Service Role Key)
- Statistik: total program, sesi, siswa

---

## 3. LOGIKA BISNIS KRITIS

### 3.1 Trigger: Generate Registration Number

**Trigger Name:** `trg_generate_reg_number`  
**Function:** `generate_reg_number()`  
**Executes:** BEFORE UPDATE pada tabel `registrations`

```sql
IF NEW.status = 'PENDING' AND OLD.status = 'DRAFT' AND NEW.reg_number IS NULL THEN
  NEW.reg_number := 'REG-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('reg_number_seq')::TEXT, 5, '0');
END IF;
```

**Kondisi:**
- Registration number hanya di-generate saat status berubah dari `'DRAFT'` ke `'PENDING'`
- Format: `REG-2026-00001`
- Sequence: `reg_number_seq` (auto-increment)

**Catatan:** Di codebase saat ini, pendaftaran langsung dibuat dengan status `'PENDING'` (tidak ada step DRAFT), jadi trigger ini berfungsi sebagai backup jika ada update manual.

---

### 3.2 Trigger: Update Session Count

**Trigger Name:** `trg_update_session_count`  
**Function:** `update_session_count()`  
**Executes:** AFTER INSERT/UPDATE/DELETE pada tabel `student_enrollments`

```sql
-- INSERT new ACTIVE enrollment
UPDATE sessions SET current_count = current_count + 1 
WHERE id = NEW.session_id;

-- UPDATE: status ACTIVE → non-ACTIVE
UPDATE sessions SET current_count = current_count - 1 
WHERE id = NEW.session_id;

-- UPDATE: status non-ACTIVE → ACTIVE
UPDATE sessions SET current_count = current_count + 1 
WHERE id = NEW.session_id;

-- DELETE enrollment ACTIVE
UPDATE sessions SET current_count = current_count - 1 
WHERE id = OLD.session_id;
```

**Tujuan:** Menjaga `sessions.current_count` tetap akurat sebagai counter enrollment aktif.

---

### 3.3 Row Level Security (RLS)

**Tabel dengan RLS:**

| Tabel | Read Policy | Write Policy |
|-------|------------|--------------|
| `profiles` | Owner / super_admin | Owner / super_admin |
| `course_master` | Public (is_active=true) | super_admin only |
| `sessions` | Public (is_active=true) | super_admin only |
| `registrations` | Owner / super_admin | Owner (DRAFT only) / super_admin |
| `student_enrollments` | Owner / super_admin | super_admin only |
| `invoices` | Owner / super_admin | super_admin only |
| `payment_proofs` | Owner / super_admin | Owner (insert) / super_admin |
| `attendances` | Owner (via enrollment) / super_admin | super_admin only |
| `course_materials` | Enrolled + Published / super_admin | super_admin only |
| `activity_logs` | super_admin only | Any authenticated (actor must match) |

**Fungsi Helper:**
```sql
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### 3.4 Persetujuan Pendaftaran (approveRegistration)

**File:** `src/lib/actions/registration.ts`

**Step-by-step:**

```typescript
// 1. Update registration status
await supabase.from('registrations').update({
  status: 'APPROVED',
  reviewed_by: admin_id,
  reviewed_at: timestamp
}).eq('id', registrationId)

// 2. Update user role → 'student'
await supabase.from('profiles').update({
  role: 'student'
}).eq('id', reg.profile_id)

// 3. Create enrollment
await supabase.from('student_enrollments').insert({
  profile_id: reg.profile_id,
  session_id: selectedSessionId,
  registration_id: registrationId,
  participant_category: reg.participant_category,
  status: 'ACTIVE'
})

// 4. Create first invoice (current month)
const amount = // based on participant_category
  // SMP → course.price_smp
  // SMA → course.price_sma
  // Umum → course.price_umum

await supabase.from('invoices').insert({
  profile_id: reg.profile_id,
  enrollment_id: newEnrollment.id,
  amount: calculatedAmount,
  period_month: currentMonth,
  period_year: currentYear,
  due_date: date(currentYear, currentMonth+1, 10), // 10th of next month
  status: 'UNPAID'
})

// 5. Trigger auto-increments session.current_count
```

---

## 4. TABEL REFERENSI DATA DUMMY

### 4.1 User Accounts

```json
[
  {
    "email": "super_admin@kursus.com",
    "password": "admin123",
    "role": "super_admin",
    "full_name": "Budi Santoso"
  },
  {
    "email": "nabilaputri@email.com",
    "password": "siswa123",
    "role": "student",
    "full_name": "Nabila Putri",
    "phone": "081234567890"
  },
  {
    "email": "raka@email.com",
    "password": "daftar123",
    "role": "applicant",
    "full_name": "Raka Pratama",
    "phone": "089876543210"
  }
]
```

### 4.2 Courses (course_master)

```json
[
  {
    "name": "Microsoft Word",
    "level": "pemula",
    "price_smp": 15000,
    "price_sma": 20000,
    "price_umum": 25000,
    "estimated_meetings": "4-8 pertemuan"
  },
  {
    "name": "Microsoft Excel",
    "level": "pemula",
    "price_smp": 15000,
    "price_sma": 20000,
    "price_umum": 25000,
    "estimated_meetings": "6-10 pertemuan"
  },
  {
    "name": "Desain Grafis: Adobe Photoshop",
    "level": "menengah",
    "price_smp": 15000,
    "price_sma": 20000,
    "price_umum": 30000,
    "estimated_meetings": "8-12 pertemuan"
  }
]
```

### 4.3 Sessions

```json
[
  {
    "name": "Word-Senin-Pagi",
    "course_id": "<COURSE_WORD_ID>",
    "instructor_name": "Pak Hendra",
    "room": "Ruang A1",
    "day_of_week": "Senin",
    "start_time": "08:00:00",
    "end_time": "10:00:00",
    "max_capacity": 15,
    "is_active": true
  },
  {
    "name": "Excel-Selasa-Siang",
    "course_id": "<COURSE_EXCEL_ID>",
    "instructor_name": "Bu Sari",
    "room": "Ruang A2",
    "day_of_week": "Selasa",
    "start_time": "13:00:00",
    "end_time": "15:00:00",
    "max_capacity": 12,
    "is_active": true
  }
]
```

### 4.4 Invoices (contoh)

```json
[
  {
    "profile_id": "<NABILA_PROFILE_ID>",
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "invoice_number": "INV-2026-00001",
    "amount": 20000,
    "period_month": 3,
    "period_year": 2026,
    "due_date": "2026-04-10",
    "status": "PAID"
  },
  {
    "profile_id": "<NABILA_PROFILE_ID>",
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "invoice_number": "INV-2026-00002",
    "amount": 20000,
    "period_month": 4,
    "period_year": 2026,
    "due_date": "2026-05-10",
    "status": "UNPAID"
  },
  {
    "profile_id": "<RAKA_PROFILE_ID>",
    "enrollment_id": "<RAKA_ENROLLMENT_ID>",
    "invoice_number": "INV-2026-00003",
    "amount": 15000,
    "period_month": 4,
    "period_year": 2026,
    "due_date": "2026-05-10",
    "status": "PENDING_VERIFICATION"
  }
]
```

### 4.5 Attendances

```json
[
  {
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "session_id": "<WORD_SESSION_ID>",
    "date": "2026-03-03",
    "meeting_number": 1,
    "status": "PRESENT"
  },
  {
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "session_id": "<WORD_SESSION_ID>",
    "date": "2026-03-10",
    "meeting_number": 2,
    "status": "PRESENT"
  },
  {
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "session_id": "<WORD_SESSION_ID>",
    "date": "2026-03-17",
    "meeting_number": 3,
    "status": "SICK"
  },
  {
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "session_id": "<WORD_SESSION_ID>",
    "date": "2026-03-24",
    "meeting_number": 4,
    "status": "PRESENT"
  },
  {
    "enrollment_id": "<NABILA_ENROLLMENT_ID>",
    "session_id": "<WORD_SESSION_ID>",
    "date": "2026-03-31",
    "meeting_number": 5,
    "status": "PERMIT"
  }
]
```

---

## 5. ENDPOINTS & ROUTES

### 5.1 Public Routes
| Path | Fungsi |
|------|--------|
| `/` | Landing page utama |
| `/login` | Halaman login |
| `/register` | Halaman registrasi akun baru |

### 5.2 Protected Routes

**Auth Required (redirects to /login):**
| Path | Akses |
|------|-------|
| `/daftar` | applicant, student |
| `/dashboard/*` | student |
| `/admin/*` | super_admin only |

### 5.3 Dashboard Routes (Student)

| Route | Fungsi |
|-------|--------|
| `/dashboard` | Overview siswa |
| `/dashboard/profil` | Edit profil |
| `/dashboard/jadwal` | Lihat jadwal (Coming Soon) |
| `/dashboard/absensi` | Riwayat absensi |
| `/dashboard/materi` | Akses materi (Coming Soon) |
| `/dashboard/iuran` | Status tagihan |
| `/dashboard/histori-iuran` | Histori pembayaran |
| `/dashboard/upload-kartu` | Upload bukti bayar |
| `/dashboard/kartu-iuran` | Lihat kartu iuran |
| `/dashboard/pengaturan` | Pengaturan akun |
| `/dashboard/pengumuman` | Lihat pengumuman (Coming Soon) |
| `/dashboard/download-materi` | Download materi (Coming Soon) |

### 5.4 Admin Routes (super_admin only)

| Route | Fungsi |
|-------|--------|
| `/admin` | Dashboard overview |
| `/admin/pendaftar` | Review pendaftaran |
| `/admin/siswa` | Kelola siswa aktif |
| `/admin/sesi` | Daftar sesi kelas |
| `/admin/jadwal` | Manajemen jadwal |
| `/admin/absensi` | Input absensi |
| `/admin/absensi/rekap` | Rekap absensi |
| `/admin/keuangan` | Verifikasi pembayaran |
| `/admin/kartu-iuran` | Cetak kartu iuran |
| `/admin/template-absen` | Template absensi cetak |
| `/admin/pengumuman` | Kelola pengumuman |
| `/admin/materi` | Kelola materi |
| `/admin/user` | Kelola semua user |
| `/admin/export` | Export laporan CSV |
| `/admin/logs` | Log aktivitas |
| `/admin/pengaturan` | Pengaturan sistem |

---

## 6. ENVIRONMENT VARIABLES

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Super Admin Seed
SUPER_ADMIN_EMAIL=super_admin@kursus.com
SUPER_ADMIN_PASSWORD=admin123
SUPER_ADMIN_FULL_NAME=Super Admin

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 7. CATATAN PENTING

### 7.1 Cara Menjalankan Seed Super Admin
```bash
npm run seed:super-admin
```

### 7.2 Troubleshooting

**Masalah:** User tidak bisa akses `/admin`
- Pastikan role di `profiles` adalah `'super_admin'`
- Cek apakah middleware redirect ke `/dashboard`

**Masalah:** Invoice tidak otomatis dibuat saat approve
- Cek apakah fungsi `approveRegistration` di `src/lib/actions/registration.ts` berjalan tanpa error
- Pastikan trigger `trg_update_session_count` aktif

**Masalah:** Siswa tidak bisa download materi
- Pastikan `is_published = true` pada `course_materials`
- Pastikan siswa punya enrollment ACTIVE di sesi terkait

**Masalah:** Bukti bayar tidak bisa diupload
- Pastikan `invoice.status` adalah `'UNPAID'` atau `'OVERDUE'`
- Jika status `PAID` atau `PENDING_VERIFICATION`, upload tidak diizinkan

### 7.3 Best Practices

1. **Jangan edit manual kolom `current_count` di `sessions`** — biarkan trigger yang handle
2. **Selalu isi alasan saat menolak pendaftaran** — untuk audit trail
3. **Verifikasi bukti bayar dengan teliti** — karena mengubah status invoice
4. **Archive enrollments yang tidak aktif** — ubah status ke `TRANSFERRED` atau `DROPPED`, jangan hapus

---

*Dokumen ini dibuat berdasarkan analisis source code pada commit terakhir.*
*Last Updated: 2026*
