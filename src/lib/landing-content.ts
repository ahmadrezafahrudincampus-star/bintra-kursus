import type { Json } from '@/types/database'

type Sortable = { sort_order: number; is_active: boolean }

export type LandingNavigationItem = Sortable & {
    label: string
    target: string
    type: 'anchor' | 'url' | 'page'
    is_button: boolean
    variant: 'link' | 'outline' | 'solid'
}

export type LandingFloatingCard = Sortable & {
    title: string
    subtitle: string
    icon: string
}

export type LandingStatItem = Sortable & {
    value: number
    suffix: string
    label: string
    icon: string
}

export type LandingFeatureItem = Sortable & {
    title: string
    description: string
    icon: string
}

export type LandingProgramItem = Sortable & {
    badge: string
    category: string
    icon: string
    title: string
    short_description: string
    level: string
    sessions_label: string
    price_label: string
    image_url: string
    image_alt: string
    cta_text: string
    cta_url: string
    features: string[]
}

export type LandingShowcaseImage = Sortable & {
    image_url: string
    alt_text: string
    caption: string
    category: string
}

export type LandingPricingPlan = Sortable & {
    name: string
    price: string
    billing_period: string
    description: string
    badge_text: string
    is_featured: boolean
    cta_text: string
    cta_url: string
    features: string[]
}

export type LandingFlowStep = Sortable & {
    title: string
    description: string
    icon: string
}

export type LandingFaqItem = Sortable & {
    question: string
    answer: string
}

export type LandingTestimonial = Sortable & {
    name: string
    role: string
    content: string
    rating: number
    photo_url: string
    photo_alt: string
    gradient_from: string
    gradient_to: string
}

export type LandingSocialLink = Sortable & {
    platform: string
    label: string
    url: string
    icon: string
}

export type LandingFooterLink = Sortable & {
    label: string
    url: string
}

export type LandingContent = {
    site_name: string
    navbar_logo_text: string
    navbar_logo_image_url: string
    navbar_logo_image_alt: string
    navigation_items: LandingNavigationItem[]
    hero_badge: string
    hero_badge_icon: string
    hero_title_prefix: string
    hero_title_accent: string
    hero_title_suffix: string
    hero_description: string
    hero_primary_cta_text: string
    hero_primary_cta_url: string
    hero_secondary_cta_text: string
    hero_secondary_cta_url: string
    hero_image_url: string
    hero_image_alt: string
    hero_floating_cards: LandingFloatingCard[]
    stats_items: LandingStatItem[]
    why_badge: string
    why_title: string
    why_description: string
    why_items: LandingFeatureItem[]
    programs_badge: string
    programs_title: string
    programs_description: string
    program_items: LandingProgramItem[]
    showcase_badge: string
    showcase_title: string
    showcase_description: string
    showcase_cta_text: string
    showcase_cta_url: string
    showcase_features: string[]
    showcase_images: LandingShowcaseImage[]
    pricing_badge: string
    pricing_title: string
    pricing_description: string
    pricing_note: string
    pricing_plans: LandingPricingPlan[]
    flow_badge: string
    flow_title: string
    flow_description: string
    flow_steps: LandingFlowStep[]
    testimonials_badge: string
    testimonials_title: string
    testimonials_description: string
    testimonials_items: LandingTestimonial[]
    faq_badge: string
    faq_title: string
    faq_description: string
    faq_items: LandingFaqItem[]
    cta_title: string
    cta_description: string
    cta_primary_text: string
    cta_primary_url: string
    cta_secondary_text: string
    cta_secondary_url: string
    footer_description: string
    footer_program_title: string
    contact_phone: string
    contact_email: string
    contact_address: string
    contact_hours: string
    social_links: LandingSocialLink[]
    footer_quick_links: LandingFooterLink[]
    footer_program_links: LandingFooterLink[]
    footer_copyright: string
    footer_policy_text: string
    footer_policy_url: string
    footer_terms_text: string
    footer_terms_url: string
    seo_meta_title: string
    seo_meta_description: string
    seo_meta_keywords: string
    seo_og_title: string
    seo_og_description: string
    seo_og_image_url: string
    seo_favicon_url: string
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
    site_name: 'Kursus Komputer',
    navbar_logo_text: 'Kursus Komputer',
    navbar_logo_image_url: '',
    navbar_logo_image_alt: 'Logo Kursus Komputer',
    navigation_items: [
        { label: 'Program', target: '#programs', type: 'anchor', is_button: false, variant: 'link', sort_order: 1, is_active: true },
        { label: 'Harga', target: '#pricing', type: 'anchor', is_button: false, variant: 'link', sort_order: 2, is_active: true },
        { label: 'FAQ', target: '#faq', type: 'anchor', is_button: false, variant: 'link', sort_order: 3, is_active: true },
        { label: 'Kontak', target: '#cta', type: 'anchor', is_button: false, variant: 'link', sort_order: 4, is_active: true },
        { label: 'Masuk', target: '/login', type: 'page', is_button: true, variant: 'outline', sort_order: 5, is_active: true },
        { label: 'Daftar Sekarang', target: '/register', type: 'page', is_button: true, variant: 'solid', sort_order: 6, is_active: true },
    ],
    hero_badge: 'Platform Kursus Komputer Terpercaya',
    hero_badge_icon: 'sparkles',
    hero_title_prefix: 'Kuasai',
    hero_title_accent: 'Skill Digital',
    hero_title_suffix: 'Untuk Masa Depanmu',
    hero_description: 'Kelas komputer berkualitas untuk siswa SMP, SMA, dan umum. Dari Microsoft Office, desain grafis, AI, hingga pembuatan website, semuanya dirancang praktis, terjangkau, dan menyenangkan.',
    hero_primary_cta_text: 'Daftar Sekarang',
    hero_primary_cta_url: '/register',
    hero_secondary_cta_text: 'Lihat Program',
    hero_secondary_cta_url: '#programs',
    hero_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=560&q=80&auto=format&fit=crop',
    hero_image_alt: 'Belajar komputer',
    hero_floating_cards: [
        { title: 'Sertifikat Resmi', subtitle: 'Diakui industri', icon: 'trophy', sort_order: 1, is_active: true },
        { title: '4.9 Rating', subtitle: '500+ ulasan', icon: 'star', sort_order: 2, is_active: true },
        { title: 'Kelas Baru', subtitle: 'AI & ChatGPT', icon: 'graduation-cap', sort_order: 3, is_active: true },
    ],
    stats_items: [
        { value: 11, suffix: '+', label: 'Program Kursus', icon: 'monitor', sort_order: 1, is_active: true },
        { value: 500, suffix: '+', label: 'Siswa Aktif', icon: 'users', sort_order: 2, is_active: true },
        { value: 98, suffix: '%', label: 'Kepuasan Siswa', icon: 'heart', sort_order: 3, is_active: true },
    ],
    why_badge: 'Kenapa Kami?',
    why_title: 'Belajar Lebih Efektif & Menyenangkan',
    why_description: 'Bukan sekadar ikut kelas, siswa dibimbing supaya cepat paham, cepat praktik, dan lebih percaya diri memakai skill digital di sekolah maupun kerja.',
    why_items: [
        { title: 'Kurikulum Up-to-Date', description: 'Materi selalu diperbarui sesuai kebutuhan industri dan perkembangan teknologi terkini.', icon: 'sparkles', sort_order: 1, is_active: true },
        { title: 'Instruktur Berpengalaman', description: 'Diajar oleh instruktur profesional yang sabar dan berpengalaman di bidangnya.', icon: 'presentation', sort_order: 2, is_active: true },
        { title: 'Kelas Kecil & Kondusif', description: 'Maksimal 8 siswa per kelas agar setiap siswa mendapat perhatian penuh.', icon: 'shield-check', sort_order: 3, is_active: true },
        { title: 'Dashboard Digital', description: 'Pantau absensi, progres belajar, dan tagihan iuran langsung dari dashboard siswa.', icon: 'layout-dashboard', sort_order: 4, is_active: true },
        { title: 'Harga Terjangkau', description: 'Mulai dari Rp 15.000 per pertemuan dengan skema iuran yang ringan dan jelas.', icon: 'wallet', sort_order: 5, is_active: true },
        { title: 'Sertifikat Resmi', description: 'Dapatkan sertifikat kelulusan setelah menyelesaikan program kursus yang diikuti.', icon: 'graduation-cap', sort_order: 6, is_active: true },
    ],
    programs_badge: 'Program Kami',
    programs_title: 'Program Kursus',
    programs_description: 'Pilih program yang paling sesuai dengan kebutuhan belajar Anda, dari pemula sampai siap praktik.',
    program_items: [
        { badge: 'Dasar', category: 'dasar', icon: 'Basic', title: 'Pengenalan Dasar Komputer', short_description: 'Belajar mengenal komputer, keyboard, file, dan internet dari nol.', level: 'Pemula', sessions_label: '4-6 sesi', price_label: 'Rp 15.000', image_url: 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=300&q=70&fit=crop', image_alt: 'Pengenalan dasar komputer', cta_text: 'Daftar', cta_url: '/register', features: ['Pengenalan perangkat', 'Latihan praktik dasar'], sort_order: 1, is_active: true },
        { badge: 'Office', category: 'office', icon: 'Word', title: 'Microsoft Word', short_description: 'Dokumen rapi untuk sekolah, kerja, dan administrasi harian.', level: 'Pemula', sessions_label: '4-8 sesi', price_label: 'Rp 15.000', image_url: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=300&q=70&fit=crop', image_alt: 'Microsoft Word', cta_text: 'Daftar', cta_url: '/register', features: ['Format dokumen', 'Surat dan tugas'], sort_order: 2, is_active: true },
        { badge: 'Office', category: 'office', icon: 'Excel', title: 'Microsoft Excel', short_description: 'Belajar tabel, rumus, dan laporan yang lebih cepat dan rapi.', level: 'Pemula-Menengah', sessions_label: '6-10 sesi', price_label: 'Rp 15.000', image_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&q=70&fit=crop', image_alt: 'Microsoft Excel', cta_text: 'Daftar', cta_url: '/register', features: ['Rumus dasar', 'Rekap data'], sort_order: 3, is_active: true },
        { badge: 'Desain', category: 'desain', icon: 'Corel', title: 'Desain Grafis: CorelDraw', short_description: 'Membuat desain poster, banner, dan materi promosi.', level: 'Menengah', sessions_label: '8-12 sesi', price_label: 'Rp 20.000', image_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&q=70&fit=crop', image_alt: 'CorelDraw', cta_text: 'Daftar', cta_url: '/register', features: ['Desain cetak', 'Latihan layout'], sort_order: 4, is_active: true },
        { badge: 'AI', category: 'ai', icon: 'Prompt', title: 'AI & ChatGPT untuk Produktivitas', short_description: 'Pakai AI untuk belajar, menulis, dan kerja lebih cepat.', level: 'Pemula', sessions_label: '4-6 sesi', price_label: 'Rp 20.000', image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=70&fit=crop', image_alt: 'AI dan ChatGPT', cta_text: 'Daftar', cta_url: '/register', features: ['Prompt dasar', 'Workflow produktivitas'], sort_order: 5, is_active: true },
        { badge: 'AI', category: 'ai', icon: 'Web', title: 'Pembuatan Website Dasar', short_description: 'Belajar dasar pembuatan website untuk pemula.', level: 'Pemula-Menengah', sessions_label: '8-12 sesi', price_label: 'Rp 20.000', image_url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&q=70&fit=crop', image_alt: 'Pembuatan website dasar', cta_text: 'Daftar', cta_url: '/register', features: ['HTML dan CSS', 'Deploy dasar'], sort_order: 6, is_active: true },
    ],
    showcase_badge: 'Fasilitas',
    showcase_title: 'Lingkungan Belajar yang Nyaman & Produktif',
    showcase_description: 'Fasilitas komputer lengkap, internet cepat, dan ruang kondusif agar siswa bisa fokus berkembang dari dasar sampai siap pakai.',
    showcase_cta_text: 'Mulai Belajar Sekarang',
    showcase_cta_url: '/register',
    showcase_features: [
        'Komputer spesifikasi terbaru dan software lengkap',
        'WiFi berkecepatan tinggi untuk kebutuhan praktik',
        'Materi bisa diunduh kapan saja setelah kelas',
        'Jadwal fleksibel: pagi, siang, atau sore hari',
        'Support dan diskusi aktif via grup WhatsApp',
    ],
    showcase_images: [
        { image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&q=80&fit=crop', alt_text: 'Fasilitas belajar 1', caption: 'Ruang belajar modern', category: 'fasilitas', sort_order: 1, is_active: true },
        { image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80&fit=crop', alt_text: 'Fasilitas belajar 2', caption: 'Praktik bersama mentor', category: 'fasilitas', sort_order: 2, is_active: true },
        { image_url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&q=80&fit=crop', alt_text: 'Fasilitas belajar 3', caption: 'Kelas aktif dan interaktif', category: 'fasilitas', sort_order: 3, is_active: true },
        { image_url: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&q=80&fit=crop', alt_text: 'Fasilitas belajar 4', caption: 'Belajar lebih fokus', category: 'fasilitas', sort_order: 4, is_active: true },
    ],
    pricing_badge: 'Harga',
    pricing_title: 'Harga Terjangkau',
    pricing_description: 'Struktur harga dibuat ringan agar siswa bisa mulai dulu tanpa beban besar, tapi tetap mendapatkan pengalaman belajar yang rapi dan serius.',
    pricing_note: 'Harga dapat berubah sesuai kebijakan lembaga. Histori tagihan tersimpan aman di sistem.',
    pricing_plans: [
        { name: 'Pelajar SMP', price: 'Rp 15.000', billing_period: 'Per pertemuan (60 menit)', description: 'Paket hemat untuk siswa SMP yang ingin mulai belajar digital dari dasar.', badge_text: '', is_featured: false, cta_text: 'Daftar Sekarang', cta_url: '/register', features: ['11 program tersedia', 'Materi dan download', 'Absensi digital', 'Dashboard siswa', 'Support admin aktif'], sort_order: 1, is_active: true },
        { name: 'Pelajar SMA', price: 'Rp 20.000', billing_period: 'Per pertemuan (60 menit)', description: 'Pilihan paling diminati untuk kebutuhan sekolah, lomba, dan persiapan kerja.', badge_text: 'Paling Diminati', is_featured: true, cta_text: 'Daftar Sekarang', cta_url: '/register', features: ['11 program tersedia', 'Materi dan download', 'Absensi digital', 'Dashboard siswa', 'Sertifikat kelulusan'], sort_order: 2, is_active: true },
        { name: 'Umum / Luar Sekolah', price: 'Fleksibel', billing_period: 'Sesuai kesepakatan dengan admin', description: 'Kelas untuk peserta umum dengan kebutuhan belajar yang lebih fleksibel.', badge_text: '', is_featured: false, cta_text: 'Hubungi Admin', cta_url: '#cta', features: ['Program bisa disesuaikan', 'Materi dan download', 'Absensi digital', 'Dashboard siswa', 'Support admin aktif'], sort_order: 3, is_active: true },
    ],
    flow_badge: 'Cara Daftar',
    flow_title: 'Alur Pendaftaran',
    flow_description: 'Prosesnya singkat, jelas, dan tidak bikin bingung bahkan untuk orang tua atau siswa yang baru pertama kali daftar kursus.',
    flow_steps: [
        { title: 'Buat Akun', description: 'Daftar dengan email Anda secara gratis.', icon: 'monitor-cog', sort_order: 1, is_active: true },
        { title: 'Isi Formulir', description: 'Lengkapi data diri dan pilih program.', icon: 'presentation', sort_order: 2, is_active: true },
        { title: 'Verifikasi Admin', description: 'Admin mereview pendaftaran Anda.', icon: 'shield-check', sort_order: 3, is_active: true },
        { title: 'Mulai Belajar', description: 'Ikuti kelas sesuai jadwal.', icon: 'bot', sort_order: 4, is_active: true },
        { title: 'Pantau Progress', description: 'Akses materi, absensi, dan iuran.', icon: 'layout-dashboard', sort_order: 5, is_active: true },
    ],
    testimonials_badge: 'Kata Mereka',
    testimonials_title: 'Pengalaman Nyata Siswa Kami',
    testimonials_description: 'Hasil belajar paling terasa saat siswa mulai lebih cepat menyelesaikan tugas, lebih rapi presentasi, dan lebih percaya diri memakai komputer.',
    testimonials_items: [
        { name: 'Rina Amelia', role: 'Pelajar SMA', content: 'Belajar Excel di sini benar-benar membantu tugas sekolah dan persiapan kerja. Pengajarnya sabar, dan saya tidak cuma paham teori tapi langsung bisa praktik.', rating: 5, photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=180&q=80&fit=crop', photo_alt: 'Rina Amelia', gradient_from: '#667eea', gradient_to: '#764ba2', sort_order: 1, is_active: true },
        { name: 'Dimas Pratama', role: 'Pelajar SMP', content: 'Awalnya saya tidak tahu desain sama sekali. Sekarang saya sudah bisa bikin poster sendiri dan lebih percaya diri saat ikut lomba di sekolah.', rating: 5, photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=180&q=80&fit=crop', photo_alt: 'Dimas Pratama', gradient_from: '#f093fb', gradient_to: '#f5576c', sort_order: 2, is_active: true },
        { name: 'Sari Wulandari', role: 'Umum / Karyawan', content: 'Saya ikut kelas Word dan PowerPoint untuk kebutuhan kantor. Materinya runtut, aplikatif, dan langsung terasa manfaatnya di pekerjaan harian.', rating: 5, photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=180&q=80&fit=crop', photo_alt: 'Sari Wulandari', gradient_from: '#4facfe', gradient_to: '#00f2fe', sort_order: 3, is_active: true },
    ],
    faq_badge: 'FAQ',
    faq_title: 'Pertanyaan Umum',
    faq_description: 'Jawaban singkat untuk pertanyaan yang paling sering ditanyakan calon siswa dan orang tua.',
    faq_items: [
        { question: 'Siapa yang paling cocok ikut kursus ini?', answer: 'Program kami cocok untuk siswa SMP, SMA, mahasiswa, karyawan, dan umum yang ingin mulai dari nol atau menaikkan skill digital secara terarah.', sort_order: 1, is_active: true },
        { question: 'Bagaimana cara mendaftar dan mulai kelas?', answer: 'Klik tombol daftar, buat akun, isi formulir singkat, lalu admin akan menghubungi untuk verifikasi dan pilihan jadwal yang paling pas.', sort_order: 2, is_active: true },
        { question: 'Biaya kursus dihitung bagaimana?', answer: 'Biaya mulai dari Rp 15.000 per pertemuan untuk pelajar SMP, Rp 20.000 untuk pelajar SMA, dan fleksibel untuk peserta umum sesuai kebutuhan belajar.', sort_order: 3, is_active: true },
        { question: 'Apakah materi dan file latihan bisa dibawa pulang?', answer: 'Bisa. Materi, file latihan, dan pengumuman kelas dapat diakses kembali melalui dashboard siswa setelah akun aktif.', sort_order: 4, is_active: true },
    ],
    cta_title: 'Siap Memulai Perjalananmu?',
    cta_description: 'Kalau Anda sedang mencari tempat belajar komputer yang rapi, ramah, dan hasilnya terasa, ini saat yang tepat untuk mulai. Sesi percobaan pertama gratis.',
    cta_primary_text: 'Daftar Gratis Sekarang',
    cta_primary_url: '/register',
    cta_secondary_text: 'Chat WhatsApp',
    cta_secondary_url: 'https://wa.me/6281234567890',
    footer_description: 'Platform belajar komputer yang membantu siswa, pelajar, dan umum menguasai skill digital secara praktis, rapi, dan menyenangkan.',
    footer_program_title: 'Program',
    contact_phone: '+62 812-3456-7890',
    contact_email: 'info@kursuskomputer.id',
    contact_address: 'Jl. Pendidikan No. 1, Kota Anda',
    contact_hours: 'Senin - Sabtu, 08.00 - 17.00 WIB',
    social_links: [
        { platform: 'Instagram', label: 'Instagram', url: '#hero', icon: 'sparkles', sort_order: 1, is_active: true },
        { platform: 'Facebook', label: 'Facebook', url: '#hero', icon: 'monitor', sort_order: 2, is_active: true },
        { platform: 'YouTube', label: 'YouTube', url: '#hero', icon: 'presentation', sort_order: 3, is_active: true },
        { platform: 'TikTok', label: 'TikTok', url: '#hero', icon: 'bot', sort_order: 4, is_active: true },
    ],
    footer_quick_links: [
        { label: 'Program Kursus', url: '#programs', sort_order: 1, is_active: true },
        { label: 'Harga', url: '#pricing', sort_order: 2, is_active: true },
        { label: 'FAQ', url: '#faq', sort_order: 3, is_active: true },
        { label: 'Masuk', url: '/login', sort_order: 4, is_active: true },
        { label: 'Daftar', url: '/register', sort_order: 5, is_active: true },
    ],
    footer_program_links: [
        { label: 'Dasar Komputer', url: '#programs', sort_order: 1, is_active: true },
        { label: 'Microsoft Office', url: '#programs', sort_order: 2, is_active: true },
        { label: 'Desain Grafis', url: '#programs', sort_order: 3, is_active: true },
        { label: 'AI & ChatGPT', url: '#programs', sort_order: 4, is_active: true },
        { label: 'Pembuatan Website', url: '#programs', sort_order: 5, is_active: true },
    ],
    footer_copyright: '© 2026 Kursus Komputer. Semua hak dilindungi.',
    footer_policy_text: 'Kebijakan Privasi',
    footer_policy_url: '#hero',
    footer_terms_text: 'Syarat & Ketentuan',
    footer_terms_url: '#hero',
    seo_meta_title: 'Kursus Komputer | Belajar Skill Digital Praktis',
    seo_meta_description: 'Kursus komputer untuk siswa SMP, SMA, dan umum. Belajar Microsoft Office, desain grafis, AI, dan website dengan kelas praktis dan terjangkau.',
    seo_meta_keywords: 'kursus komputer, microsoft office, desain grafis, chatgpt, kursus excel, kursus word, kursus website',
    seo_og_title: 'Kursus Komputer',
    seo_og_description: 'Belajar skill digital secara praktis.',
    seo_og_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80&auto=format&fit=crop',
    seo_favicon_url: '',
}

function text(value: unknown, fallback: string) {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function bool(value: unknown, fallback = true) {
    return typeof value === 'boolean' ? value : fallback
}

function num(value: unknown, fallback: number) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function strings(value: unknown, fallback: string[]) {
    if (!Array.isArray(value)) return fallback
    const items = value.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
    return items.length > 0 ? items : fallback
}

function jsonItems<T>(value: Json | null | undefined, fallback: T[], map: (item: unknown, index: number) => T | null) {
    if (!Array.isArray(value)) return fallback
    const items = value.map(map).filter((item): item is T => item !== null)
    return items.length > 0 ? items : fallback
}

function sort<T extends Sortable>(items: T[]) {
    return [...items].sort((left, right) => left.sort_order - right.sort_order)
}

function asRecord(item: unknown) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return null
    }

    return item as Record<string, unknown>
}

export function normalizeLandingContent(value: Partial<LandingContent> | Record<string, Json | string | number | boolean | null | undefined> | null | undefined): LandingContent {
    const objectValue = value ?? {}

    const navigation_items = sort(jsonItems(objectValue.navigation_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.navigation_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        const type: LandingNavigationItem['type'] =
            row.type === 'anchor' || row.type === 'url' || row.type === 'page' ? row.type : 'anchor'
        const variant: LandingNavigationItem['variant'] =
            row.variant === 'link' || row.variant === 'outline' || row.variant === 'solid'
                ? row.variant
                : 'link'
        return { label: text(row.label, 'Item'), target: text(row.target, '#hero'), type, is_button: bool(row.is_button, false), variant, sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const hero_floating_cards = sort(jsonItems(objectValue.hero_floating_cards as Json | null | undefined, DEFAULT_LANDING_CONTENT.hero_floating_cards, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { title: text(row.title, 'Kartu'), subtitle: text(row.subtitle, 'Subjudul'), icon: text(row.icon, 'sparkles'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const stats_items = sort(jsonItems(objectValue.stats_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.stats_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { value: num(row.value, 0), suffix: text(row.suffix, ''), label: text(row.label, 'Label'), icon: text(row.icon, 'monitor'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const why_items = sort(jsonItems(objectValue.why_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.why_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { title: text(row.title, 'Fitur'), description: text(row.description, 'Deskripsi'), icon: text(row.icon, 'sparkles'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const program_items = sort(jsonItems(objectValue.program_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.program_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { badge: text(row.badge, 'Program'), category: text(row.category, 'umum'), icon: text(row.icon, 'Basic'), title: text(row.title, 'Program'), short_description: text(row.short_description, 'Deskripsi program'), level: text(row.level, 'Pemula'), sessions_label: text(row.sessions_label, '4 sesi'), price_label: text(row.price_label, 'Rp 0'), image_url: text(row.image_url, ''), image_alt: text(row.image_alt, 'Gambar program'), cta_text: text(row.cta_text, 'Daftar'), cta_url: text(row.cta_url, '/register'), features: strings(row.features, []), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const showcase_images = sort(jsonItems(objectValue.showcase_images as Json | null | undefined, DEFAULT_LANDING_CONTENT.showcase_images, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { image_url: text(row.image_url, ''), alt_text: text(row.alt_text, 'Galeri belajar'), caption: text(row.caption, ''), category: text(row.category, 'galeri'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const pricing_plans = sort(jsonItems(objectValue.pricing_plans as Json | null | undefined, DEFAULT_LANDING_CONTENT.pricing_plans, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { name: text(row.name, 'Paket'), price: text(row.price, 'Rp 0'), billing_period: text(row.billing_period, ''), description: text(row.description, ''), badge_text: text(row.badge_text, ''), is_featured: bool(row.is_featured, false), cta_text: text(row.cta_text, 'Daftar'), cta_url: text(row.cta_url, '/register'), features: strings(row.features, []), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const flow_steps = sort(jsonItems(objectValue.flow_steps as Json | null | undefined, DEFAULT_LANDING_CONTENT.flow_steps, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { title: text(row.title, 'Langkah'), description: text(row.description, 'Deskripsi langkah'), icon: text(row.icon, 'sparkles'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const testimonials_items = sort(jsonItems(objectValue.testimonials_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.testimonials_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { name: text(row.name, 'Siswa'), role: text(row.role, 'Peserta'), content: text(row.content, 'Testimoni'), rating: num(row.rating, 5), photo_url: text(row.photo_url, ''), photo_alt: text(row.photo_alt, 'Foto testimoni'), gradient_from: text(row.gradient_from, '#667eea'), gradient_to: text(row.gradient_to, '#764ba2'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const faq_items = sort(jsonItems(objectValue.faq_items as Json | null | undefined, DEFAULT_LANDING_CONTENT.faq_items, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { question: text(row.question, 'Pertanyaan'), answer: text(row.answer, 'Jawaban'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const social_links = sort(jsonItems(objectValue.social_links as Json | null | undefined, DEFAULT_LANDING_CONTENT.social_links, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { platform: text(row.platform, 'Social'), label: text(row.label, 'Social'), url: text(row.url, '#hero'), icon: text(row.icon, 'sparkles'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const footer_quick_links = sort(jsonItems(objectValue.footer_quick_links as Json | null | undefined, DEFAULT_LANDING_CONTENT.footer_quick_links, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { label: text(row.label, 'Link'), url: text(row.url, '#hero'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))
    const footer_program_links = sort(jsonItems(objectValue.footer_program_links as Json | null | undefined, DEFAULT_LANDING_CONTENT.footer_program_links, (item, index) => {
        const row = asRecord(item)
        if (!row) return null
        return { label: text(row.label, 'Link'), url: text(row.url, '#programs'), sort_order: num(row.sort_order, index + 1), is_active: bool(row.is_active, true) }
    }))

    return {
        site_name: text(objectValue.site_name, DEFAULT_LANDING_CONTENT.site_name),
        navbar_logo_text: text(objectValue.navbar_logo_text, DEFAULT_LANDING_CONTENT.navbar_logo_text),
        navbar_logo_image_url: text(objectValue.navbar_logo_image_url, DEFAULT_LANDING_CONTENT.navbar_logo_image_url),
        navbar_logo_image_alt: text(objectValue.navbar_logo_image_alt, DEFAULT_LANDING_CONTENT.navbar_logo_image_alt),
        navigation_items,
        hero_badge: text(objectValue.hero_badge, DEFAULT_LANDING_CONTENT.hero_badge),
        hero_badge_icon: text(objectValue.hero_badge_icon, DEFAULT_LANDING_CONTENT.hero_badge_icon),
        hero_title_prefix: text(objectValue.hero_title_prefix, DEFAULT_LANDING_CONTENT.hero_title_prefix),
        hero_title_accent: text(objectValue.hero_title_accent, DEFAULT_LANDING_CONTENT.hero_title_accent),
        hero_title_suffix: text(objectValue.hero_title_suffix, DEFAULT_LANDING_CONTENT.hero_title_suffix),
        hero_description: text(objectValue.hero_description, DEFAULT_LANDING_CONTENT.hero_description),
        hero_primary_cta_text: text(objectValue.hero_primary_cta_text, DEFAULT_LANDING_CONTENT.hero_primary_cta_text),
        hero_primary_cta_url: text(objectValue.hero_primary_cta_url, DEFAULT_LANDING_CONTENT.hero_primary_cta_url),
        hero_secondary_cta_text: text(objectValue.hero_secondary_cta_text, DEFAULT_LANDING_CONTENT.hero_secondary_cta_text),
        hero_secondary_cta_url: text(objectValue.hero_secondary_cta_url, DEFAULT_LANDING_CONTENT.hero_secondary_cta_url),
        hero_image_url: text(objectValue.hero_image_url, DEFAULT_LANDING_CONTENT.hero_image_url),
        hero_image_alt: text(objectValue.hero_image_alt, DEFAULT_LANDING_CONTENT.hero_image_alt),
        hero_floating_cards,
        stats_items,
        why_badge: text(objectValue.why_badge, DEFAULT_LANDING_CONTENT.why_badge),
        why_title: text(objectValue.why_title, DEFAULT_LANDING_CONTENT.why_title),
        why_description: text(objectValue.why_description, DEFAULT_LANDING_CONTENT.why_description),
        why_items,
        programs_badge: text(objectValue.programs_badge, DEFAULT_LANDING_CONTENT.programs_badge),
        programs_title: text(objectValue.programs_title, DEFAULT_LANDING_CONTENT.programs_title),
        programs_description: text(objectValue.programs_description, DEFAULT_LANDING_CONTENT.programs_description),
        program_items,
        showcase_badge: text(objectValue.showcase_badge, DEFAULT_LANDING_CONTENT.showcase_badge),
        showcase_title: text(objectValue.showcase_title, DEFAULT_LANDING_CONTENT.showcase_title),
        showcase_description: text(objectValue.showcase_description, DEFAULT_LANDING_CONTENT.showcase_description),
        showcase_cta_text: text(objectValue.showcase_cta_text, DEFAULT_LANDING_CONTENT.showcase_cta_text),
        showcase_cta_url: text(objectValue.showcase_cta_url, DEFAULT_LANDING_CONTENT.showcase_cta_url),
        showcase_features: strings(objectValue.showcase_features, DEFAULT_LANDING_CONTENT.showcase_features),
        showcase_images,
        pricing_badge: text(objectValue.pricing_badge, DEFAULT_LANDING_CONTENT.pricing_badge),
        pricing_title: text(objectValue.pricing_title, DEFAULT_LANDING_CONTENT.pricing_title),
        pricing_description: text(objectValue.pricing_description, DEFAULT_LANDING_CONTENT.pricing_description),
        pricing_note: text(objectValue.pricing_note, DEFAULT_LANDING_CONTENT.pricing_note),
        pricing_plans,
        flow_badge: text(objectValue.flow_badge, DEFAULT_LANDING_CONTENT.flow_badge),
        flow_title: text(objectValue.flow_title, DEFAULT_LANDING_CONTENT.flow_title),
        flow_description: text(objectValue.flow_description, DEFAULT_LANDING_CONTENT.flow_description),
        flow_steps,
        testimonials_badge: text(objectValue.testimonials_badge, DEFAULT_LANDING_CONTENT.testimonials_badge),
        testimonials_title: text(objectValue.testimonials_title, DEFAULT_LANDING_CONTENT.testimonials_title),
        testimonials_description: text(objectValue.testimonials_description, DEFAULT_LANDING_CONTENT.testimonials_description),
        testimonials_items,
        faq_badge: text(objectValue.faq_badge, DEFAULT_LANDING_CONTENT.faq_badge),
        faq_title: text(objectValue.faq_title, DEFAULT_LANDING_CONTENT.faq_title),
        faq_description: text(objectValue.faq_description, DEFAULT_LANDING_CONTENT.faq_description),
        faq_items,
        cta_title: text(objectValue.cta_title, DEFAULT_LANDING_CONTENT.cta_title),
        cta_description: text(objectValue.cta_description, DEFAULT_LANDING_CONTENT.cta_description),
        cta_primary_text: text(objectValue.cta_primary_text, DEFAULT_LANDING_CONTENT.cta_primary_text),
        cta_primary_url: text(objectValue.cta_primary_url, DEFAULT_LANDING_CONTENT.cta_primary_url),
        cta_secondary_text: text(objectValue.cta_secondary_text, DEFAULT_LANDING_CONTENT.cta_secondary_text),
        cta_secondary_url: text(objectValue.cta_secondary_url, DEFAULT_LANDING_CONTENT.cta_secondary_url),
        footer_description: text(objectValue.footer_description, DEFAULT_LANDING_CONTENT.footer_description),
        footer_program_title: text(objectValue.footer_program_title, DEFAULT_LANDING_CONTENT.footer_program_title),
        contact_phone: text(objectValue.contact_phone, DEFAULT_LANDING_CONTENT.contact_phone),
        contact_email: text(objectValue.contact_email, DEFAULT_LANDING_CONTENT.contact_email),
        contact_address: text(objectValue.contact_address, DEFAULT_LANDING_CONTENT.contact_address),
        contact_hours: text(objectValue.contact_hours, DEFAULT_LANDING_CONTENT.contact_hours),
        social_links,
        footer_quick_links,
        footer_program_links,
        footer_copyright: text(objectValue.footer_copyright, DEFAULT_LANDING_CONTENT.footer_copyright),
        footer_policy_text: text(objectValue.footer_policy_text, DEFAULT_LANDING_CONTENT.footer_policy_text),
        footer_policy_url: text(objectValue.footer_policy_url, DEFAULT_LANDING_CONTENT.footer_policy_url),
        footer_terms_text: text(objectValue.footer_terms_text, DEFAULT_LANDING_CONTENT.footer_terms_text),
        footer_terms_url: text(objectValue.footer_terms_url, DEFAULT_LANDING_CONTENT.footer_terms_url),
        seo_meta_title: text(objectValue.seo_meta_title, DEFAULT_LANDING_CONTENT.seo_meta_title),
        seo_meta_description: text(objectValue.seo_meta_description, DEFAULT_LANDING_CONTENT.seo_meta_description),
        seo_meta_keywords: text(objectValue.seo_meta_keywords, DEFAULT_LANDING_CONTENT.seo_meta_keywords),
        seo_og_title: text(objectValue.seo_og_title, DEFAULT_LANDING_CONTENT.seo_og_title),
        seo_og_description: text(objectValue.seo_og_description, DEFAULT_LANDING_CONTENT.seo_og_description),
        seo_og_image_url: text(objectValue.seo_og_image_url, DEFAULT_LANDING_CONTENT.seo_og_image_url),
        seo_favicon_url: text(objectValue.seo_favicon_url, DEFAULT_LANDING_CONTENT.seo_favicon_url),
    }
}

