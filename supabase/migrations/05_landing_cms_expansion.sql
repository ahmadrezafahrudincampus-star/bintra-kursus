alter table public.landing_page_content
    add column if not exists site_name text not null default 'Kursus Komputer',
    add column if not exists navbar_logo_text text not null default 'Kursus Komputer',
    add column if not exists navbar_logo_image_url text,
    add column if not exists navbar_logo_image_alt text,
    add column if not exists navigation_items jsonb not null default '[]'::jsonb,
    add column if not exists hero_badge_icon text,
    add column if not exists hero_primary_cta_text text,
    add column if not exists hero_primary_cta_url text,
    add column if not exists hero_secondary_cta_text text,
    add column if not exists hero_secondary_cta_url text,
    add column if not exists hero_image_url text,
    add column if not exists hero_image_alt text,
    add column if not exists hero_floating_cards jsonb not null default '[]'::jsonb,
    add column if not exists stats_items jsonb not null default '[]'::jsonb,
    add column if not exists why_badge text,
    add column if not exists why_title text,
    add column if not exists why_description text,
    add column if not exists why_items jsonb not null default '[]'::jsonb,
    add column if not exists programs_badge text,
    add column if not exists programs_title text,
    add column if not exists programs_description text,
    add column if not exists program_items jsonb not null default '[]'::jsonb,
    add column if not exists showcase_badge text,
    add column if not exists showcase_title text,
    add column if not exists showcase_description text,
    add column if not exists showcase_cta_text text,
    add column if not exists showcase_cta_url text,
    add column if not exists showcase_features jsonb not null default '[]'::jsonb,
    add column if not exists showcase_images jsonb not null default '[]'::jsonb,
    add column if not exists pricing_badge text,
    add column if not exists pricing_title text,
    add column if not exists pricing_description text,
    add column if not exists pricing_note text,
    add column if not exists pricing_plans jsonb not null default '[]'::jsonb,
    add column if not exists flow_badge text,
    add column if not exists flow_title text,
    add column if not exists flow_description text,
    add column if not exists flow_steps jsonb not null default '[]'::jsonb,
    add column if not exists testimonials_badge text,
    add column if not exists testimonials_title text,
    add column if not exists testimonials_description text,
    add column if not exists testimonials_items jsonb not null default '[]'::jsonb,
    add column if not exists faq_badge text,
    add column if not exists cta_title text,
    add column if not exists cta_description text,
    add column if not exists cta_primary_text text,
    add column if not exists cta_primary_url text,
    add column if not exists cta_secondary_text text,
    add column if not exists cta_secondary_url text,
    add column if not exists footer_description text,
    add column if not exists footer_program_title text,
    add column if not exists contact_phone text,
    add column if not exists contact_email text,
    add column if not exists contact_address text,
    add column if not exists contact_hours text,
    add column if not exists social_links jsonb not null default '[]'::jsonb,
    add column if not exists footer_quick_links jsonb not null default '[]'::jsonb,
    add column if not exists footer_program_links jsonb not null default '[]'::jsonb,
    add column if not exists footer_copyright text,
    add column if not exists footer_policy_text text,
    add column if not exists footer_policy_url text,
    add column if not exists footer_terms_text text,
    add column if not exists footer_terms_url text,
    add column if not exists seo_meta_title text,
    add column if not exists seo_meta_description text,
    add column if not exists seo_meta_keywords text,
    add column if not exists seo_og_title text,
    add column if not exists seo_og_description text,
    add column if not exists seo_og_image_url text,
    add column if not exists seo_favicon_url text;

create table if not exists public.media_assets (
    id uuid primary key default gen_random_uuid(),
    file_name text not null,
    file_path text not null unique,
    public_url text not null unique,
    alt_text text,
    mime_type text,
    size_bytes bigint,
    category text default 'landing',
    uploaded_by uuid references public.profiles(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
);

alter table public.media_assets enable row level security;

drop policy if exists "media_assets_admin_read" on public.media_assets;
create policy "media_assets_admin_read" on public.media_assets
for select using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

drop policy if exists "media_assets_admin_insert" on public.media_assets;
create policy "media_assets_admin_insert" on public.media_assets
for insert with check (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

drop policy if exists "media_assets_admin_delete" on public.media_assets;
create policy "media_assets_admin_delete" on public.media_assets
for delete using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'landing-media',
  'landing-media',
  true,
  5242880,
  array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "landing_media_admin_insert" on storage.objects;
create policy "landing_media_admin_insert" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'landing-media' and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

drop policy if exists "landing_media_admin_update" on storage.objects;
create policy "landing_media_admin_update" on storage.objects
for update to authenticated
using (
  bucket_id = 'landing-media' and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
)
with check (
  bucket_id = 'landing-media' and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

drop policy if exists "landing_media_admin_delete" on storage.objects;
create policy "landing_media_admin_delete" on storage.objects
for delete to authenticated
using (
  bucket_id = 'landing-media' and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'super_admin'
  )
);

update public.landing_page_content
set
  site_name = coalesce(site_name, 'Kursus Komputer'),
  navbar_logo_text = coalesce(navbar_logo_text, 'Kursus Komputer'),
  navigation_items = case when jsonb_array_length(navigation_items) = 0 then '[
    {"label":"Program","target":"#programs","type":"anchor","is_button":false,"variant":"link","sort_order":1,"is_active":true},
    {"label":"Harga","target":"#pricing","type":"anchor","is_button":false,"variant":"link","sort_order":2,"is_active":true},
    {"label":"FAQ","target":"#faq","type":"anchor","is_button":false,"variant":"link","sort_order":3,"is_active":true},
    {"label":"Kontak","target":"#cta","type":"anchor","is_button":false,"variant":"link","sort_order":4,"is_active":true},
    {"label":"Masuk","target":"/login","type":"page","is_button":true,"variant":"outline","sort_order":5,"is_active":true},
    {"label":"Daftar Sekarang","target":"/register","type":"page","is_button":true,"variant":"solid","sort_order":6,"is_active":true}
  ]'::jsonb else navigation_items end,
  hero_badge_icon = coalesce(hero_badge_icon, 'sparkles'),
  hero_primary_cta_text = coalesce(hero_primary_cta_text, 'Daftar Sekarang'),
  hero_primary_cta_url = coalesce(hero_primary_cta_url, '/register'),
  hero_secondary_cta_text = coalesce(hero_secondary_cta_text, 'Lihat Program'),
  hero_secondary_cta_url = coalesce(hero_secondary_cta_url, '#programs'),
  hero_image_url = coalesce(hero_image_url, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=560&q=80&auto=format&fit=crop'),
  hero_image_alt = coalesce(hero_image_alt, 'Belajar komputer'),
  pricing_badge = coalesce(pricing_badge, 'Harga'),
  pricing_title = coalesce(pricing_title, 'Harga Terjangkau'),
  testimonials_badge = coalesce(testimonials_badge, 'Kata Mereka'),
  testimonials_title = coalesce(testimonials_title, 'Pengalaman Nyata Siswa Kami'),
  faq_badge = coalesce(faq_badge, 'FAQ'),
  cta_title = coalesce(cta_title, 'Siap Memulai Perjalananmu?'),
  cta_primary_text = coalesce(cta_primary_text, 'Daftar Gratis Sekarang'),
  cta_primary_url = coalesce(cta_primary_url, '/register'),
  cta_secondary_text = coalesce(cta_secondary_text, 'Chat WhatsApp'),
  cta_secondary_url = coalesce(cta_secondary_url, 'https://wa.me/6281234567890'),
  footer_description = coalesce(footer_description, 'Platform edukasi digital untuk belajar komputer secara praktis, terstruktur, dan ramah pemula.'),
  footer_program_title = coalesce(footer_program_title, 'Program'),
  contact_phone = coalesce(contact_phone, '+62 812-3456-7890'),
  contact_email = coalesce(contact_email, 'info@kursuskomputer.id'),
  contact_address = coalesce(contact_address, 'Jl. Pendidikan No. 1, Kota Anda'),
  contact_hours = coalesce(contact_hours, 'Senin - Sabtu, 08.00 - 17.00 WIB'),
  footer_copyright = coalesce(footer_copyright, '© 2026 Kursus Komputer. Semua hak dilindungi.'),
  footer_policy_text = coalesce(footer_policy_text, 'Kebijakan Privasi'),
  footer_policy_url = coalesce(footer_policy_url, '#hero'),
  footer_terms_text = coalesce(footer_terms_text, 'Syarat & Ketentuan'),
  footer_terms_url = coalesce(footer_terms_url, '#hero'),
  seo_meta_title = coalesce(seo_meta_title, 'Platform kursus komputer terpercaya'),
  seo_meta_description = coalesce(seo_meta_description, 'Platform kursus komputer terpercaya untuk siswa SMP, SMA, dan umum.'),
  seo_meta_keywords = coalesce(seo_meta_keywords, 'kursus komputer, office, desain grafis, ai'),
  seo_og_title = coalesce(seo_og_title, 'Kursus Komputer'),
  seo_og_description = coalesce(seo_og_description, 'Belajar skill digital secara praktis, terjangkau, dan menyenangkan.'),
  seo_og_image_url = coalesce(seo_og_image_url, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop');
