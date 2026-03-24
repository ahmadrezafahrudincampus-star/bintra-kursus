create table if not exists public.landing_page_content (
    id text primary key default 'main',
    hero_badge text not null,
    hero_title_prefix text not null,
    hero_title_accent text not null,
    hero_title_suffix text not null,
    hero_description text not null,
    faq_title text not null,
    faq_description text not null,
    faq_items jsonb not null default '[]'::jsonb,
    updated_by uuid references public.profiles(id) on delete set null,
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.landing_page_content enable row level security;

create policy "landing_page_content_public_read"
on public.landing_page_content
for select
using (true);

create policy "landing_page_content_super_admin_update"
on public.landing_page_content
for update
using (
    exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
    )
)
with check (
    exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
    )
);

create policy "landing_page_content_super_admin_insert"
on public.landing_page_content
for insert
with check (
    exists (
        select 1
        from public.profiles
        where profiles.id = auth.uid()
          and profiles.role = 'super_admin'
    )
);

insert into public.landing_page_content (
    id,
    hero_badge,
    hero_title_prefix,
    hero_title_accent,
    hero_title_suffix,
    hero_description,
    faq_title,
    faq_description,
    faq_items
) values (
    'main',
    'Platform Kursus Komputer Terpercaya',
    'Kuasai',
    'Skill Digital',
    'Untuk Masa Depanmu',
    'Kelas komputer berkualitas untuk siswa SMP, SMA, dan umum. Dari Microsoft Office, desain grafis, AI, hingga pembuatan website, semuanya dirancang praktis, terjangkau, dan menyenangkan.',
    'Pertanyaan Umum',
    'Jawaban singkat untuk pertanyaan yang paling sering ditanyakan calon siswa dan orang tua.',
    '[
      {"question":"Siapa yang paling cocok ikut kursus ini?","answer":"Program kami cocok untuk siswa SMP, SMA, mahasiswa, karyawan, dan umum yang ingin mulai dari nol atau menaikkan skill digital secara terarah."},
      {"question":"Bagaimana cara mendaftar dan mulai kelas?","answer":"Klik tombol daftar, buat akun, isi formulir singkat, lalu admin akan menghubungi untuk verifikasi dan pilihan jadwal yang paling pas."},
      {"question":"Biaya kursus dihitung bagaimana?","answer":"Biaya mulai dari Rp 15.000 per pertemuan untuk pelajar SMP, Rp 20.000 untuk pelajar SMA, dan fleksibel untuk peserta umum sesuai kebutuhan belajar."},
      {"question":"Apakah materi dan file latihan bisa dibawa pulang?","answer":"Bisa. Materi, file latihan, dan pengumuman kelas dapat diakses kembali melalui dashboard siswa setelah akun aktif."},
      {"question":"Apakah kelasnya ramai?","answer":"Tidak. Kapasitas kelas dibuat kecil agar mentor bisa lebih fokus membimbing setiap siswa dan proses belajar terasa lebih nyaman."},
      {"question":"Bagaimana pembayaran iuran dilakukan?","answer":"Pembayaran dapat dilakukan per pertemuan atau sesuai kesepakatan program. Riwayat tagihan dan upload bukti tersimpan rapi di dashboard."},
      {"question":"Apakah ada sertifikat setelah selesai?","answer":"Ya. Setelah program selesai, siswa akan menerima sertifikat digital resmi yang bisa dipakai untuk portofolio pribadi."}
    ]'::jsonb
) on conflict (id) do nothing;
