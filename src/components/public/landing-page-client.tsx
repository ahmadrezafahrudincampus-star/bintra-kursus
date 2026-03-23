'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Code2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Monitor,
  MonitorCog,
  Phone,
  Presentation,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Wallet,
  X,
} from 'lucide-react'

type LandingPageClientProps = {
  bodyFontClass: string
  headingFontClass: string
}

type ProgramCategory = 'dasar' | 'office' | 'desain' | 'ai'

type Program = {
  cat: ProgramCategory
  badge: string
  icon: string
  title: string
  level: string
  sessions: string
  price: string
  image: string
}

const NAV_ITEMS = [
  { href: '#programs', label: 'Program' },
  { href: '#pricing', label: 'Harga' },
  { href: '#faq', label: 'FAQ' },
  { href: '#cta', label: 'Kontak' },
] as const

const TYPE_WORDS = [
  'Skill Digital',
  'Microsoft Office',
  'Desain Grafis',
  'AI & ChatGPT',
  'Website Kamu',
] as const

const PROGRAMS: Program[] = [
  { cat: 'dasar', badge: 'Dasar', icon: 'Basic', title: 'Pengenalan Dasar Komputer', level: 'Pemula', sessions: '4-6', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=300&q=70&fit=crop' },
  { cat: 'office', badge: 'Office', icon: 'Word', title: 'Microsoft Word', level: 'Pemula', sessions: '4-8', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=300&q=70&fit=crop' },
  { cat: 'office', badge: 'Office', icon: 'Excel', title: 'Microsoft Excel', level: 'Pemula-Menengah', sessions: '6-10', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&q=70&fit=crop' },
  { cat: 'office', badge: 'Office', icon: 'Slide', title: 'Microsoft PowerPoint', level: 'Pemula', sessions: '4-6', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&q=70&fit=crop' },
  { cat: 'desain', badge: 'Desain', icon: 'Corel', title: 'Desain Grafis: CorelDraw', level: 'Menengah', sessions: '8-12', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=300&q=70&fit=crop' },
  { cat: 'desain', badge: 'Desain', icon: 'Photo', title: 'Adobe Photoshop', level: 'Menengah', sessions: '8-12', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=300&q=70&fit=crop' },
  { cat: 'desain', badge: 'Desain', icon: 'Vector', title: 'Adobe Illustrator', level: 'Menengah', sessions: '8-12', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1609921141835-710b7fa6e438?w=300&q=70&fit=crop' },
  { cat: 'desain', badge: 'Desain', icon: 'Video', title: 'Editing Video CapCut', level: 'Pemula', sessions: '4-6', price: 'Rp 15.000', image: 'https://images.unsplash.com/photo-1536240478700-b869ad10e128?w=300&q=70&fit=crop' },
  { cat: 'ai', badge: 'AI', icon: 'Prompt', title: 'AI & ChatGPT untuk Produktivitas', level: 'Pemula', sessions: '4-6', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=70&fit=crop' },
  { cat: 'ai', badge: 'AI', icon: 'Image AI', title: 'AI Image Generation', level: 'Pemula', sessions: '3-5', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=300&q=70&fit=crop' },
  { cat: 'ai', badge: 'AI', icon: 'Web', title: 'Pembuatan Website Dasar', level: 'Pemula-Menengah', sessions: '8-12', price: 'Rp 20.000', image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&q=70&fit=crop' },
]

const FAQS = [
  ['Siapa yang paling cocok ikut kursus ini?', 'Program kami cocok untuk siswa SMP, SMA, mahasiswa, karyawan, dan umum yang ingin mulai dari nol atau menaikkan skill digital secara terarah.'],
  ['Bagaimana cara mendaftar dan mulai kelas?', 'Klik tombol daftar, buat akun, isi formulir singkat, lalu admin akan menghubungi untuk verifikasi dan pilihan jadwal yang paling pas.'],
  ['Biaya kursus dihitung bagaimana?', 'Biaya mulai dari Rp 15.000 per pertemuan untuk pelajar SMP, Rp 20.000 untuk pelajar SMA, dan fleksibel untuk peserta umum sesuai kebutuhan belajar.'],
  ['Apakah materi dan file latihan bisa dibawa pulang?', 'Bisa. Materi, file latihan, dan pengumuman kelas dapat diakses kembali melalui dashboard siswa setelah akun aktif.'],
  ['Apakah kelasnya ramai?', 'Tidak. Kapasitas kelas dibuat kecil agar mentor bisa lebih fokus membimbing setiap siswa dan proses belajar terasa lebih nyaman.'],
  ['Bagaimana pembayaran iuran dilakukan?', 'Pembayaran dapat dilakukan per pertemuan atau sesuai kesepakatan program. Riwayat tagihan dan upload bukti tersimpan rapi di dashboard.'],
  ['Apakah ada sertifikat setelah selesai?', 'Ya. Setelah program selesai, siswa akan menerima sertifikat digital resmi yang bisa dipakai untuk portofolio pribadi.'],
] as const

const TESTIMONIALS = [
  { name: 'Rina Amelia', role: 'Pelajar SMA', quote: 'Belajar Excel di sini benar-benar membantu tugas sekolah dan persiapan kerja. Pengajarnya sabar, dan saya tidak cuma paham teori tapi langsung bisa praktik.', initial: 'R', gradient: 'from-[#667eea] to-[#764ba2]' },
  { name: 'Dimas Pratama', role: 'Pelajar SMP', quote: 'Awalnya saya tidak tahu desain sama sekali. Sekarang saya sudah bisa bikin poster sendiri dan lebih percaya diri saat ikut lomba di sekolah.', initial: 'D', gradient: 'from-[#f093fb] to-[#f5576c]' },
  { name: 'Sari Wulandari', role: 'Umum / Karyawan', quote: 'Saya ikut kelas Word dan PowerPoint untuk kebutuhan kantor. Materinya runtut, aplikatif, dan langsung terasa manfaatnya di pekerjaan harian.', initial: 'S', gradient: 'from-[#4facfe] to-[#00f2fe]' },
  { name: 'Arif Budiman', role: 'Pelajar SMA', quote: 'Kelas AI dan ChatGPT membuka wawasan saya. Sekarang saya bisa pakai AI untuk belajar lebih cepat, menulis lebih rapi, dan bantu tugas presentasi.', initial: 'A', gradient: 'from-[#43e97b] to-[#38f9d7]' },
  { name: 'Nadia Putri', role: 'Pelajar SMA', quote: 'Instruktur CapCut-nya keren dan penjelasannya gampang diikuti. Dalam beberapa pertemuan saya sudah bisa bikin video yang layak diposting ke media sosial.', initial: 'N', gradient: 'from-[#fa709a] to-[#fee140]' },
  { name: 'Budi Santoso', role: 'Wali Murid', quote: 'Harga tetap masuk akal, tapi hasilnya terasa. Anak saya jadi lebih mandiri mengerjakan tugas sekolah dan tidak canggung lagi pakai komputer.', initial: 'B', gradient: 'from-[#a18cd1] to-[#fbc2eb]' },
] as const

const SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&q=80&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&q=80&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=300&q=80&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=300&q=80&fit=crop',
] as const

export function LandingPageClient({
  bodyFontClass,
  headingFontClass,
}: LandingPageClientProps) {
  const [filter, setFilter] = useState<'all' | ProgramCategory>('all')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [typedWord, setTypedWord] = useState(TYPE_WORDS[0])
  const [counters, setCounters] = useState({ programs: 0, students: 0, satisfaction: 0 })

  const filteredPrograms = useMemo(
    () => (filter === 'all' ? PROGRAMS : PROGRAMS.filter((program) => program.cat === filter)),
    [filter]
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    let wordIndex = 0
    let charIndex = 0
    let deleting = false
    let timer: ReturnType<typeof setTimeout>

    const tick = () => {
      const currentWord = TYPE_WORDS[wordIndex]

      if (!deleting) {
        setTypedWord(currentWord.slice(0, charIndex + 1))
        charIndex += 1
        if (charIndex === currentWord.length) {
          deleting = true
          timer = setTimeout(tick, 1800)
          return
        }
      } else {
        setTypedWord(currentWord.slice(0, charIndex - 1))
        charIndex -= 1
        if (charIndex === 0) {
          deleting = false
          wordIndex = (wordIndex + 1) % TYPE_WORDS.length
        }
      }

      timer = setTimeout(tick, deleting ? 55 : 85)
    }

    timer = setTimeout(tick, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    document
      .querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right')
      .forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [filteredPrograms])

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    let started = false
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return
          started = true

          const targets = { programs: 11, students: 500, satisfaction: 98 }
          const current = { programs: 0, students: 0, satisfaction: 0 }

          const timer = window.setInterval(() => {
            current.programs = Math.min(current.programs + Math.ceil(targets.programs / 60), targets.programs)
            current.students = Math.min(current.students + Math.ceil(targets.students / 60), targets.students)
            current.satisfaction = Math.min(current.satisfaction + Math.ceil(targets.satisfaction / 60), targets.satisfaction)
            setCounters({ ...current })

            if (
              current.programs === targets.programs &&
              current.students === targets.students &&
              current.satisfaction === targets.satisfaction
            ) {
              clearInterval(timer)
            }
          }, 20)

          counterObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.5 }
    )

    counterObserver.observe(hero)
    return () => counterObserver.disconnect()
  }, [])

  return (
    <div className={`${bodyFontClass} landing-shell min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]`}>
      <style jsx global>{`
        :root{--blue:#1A56FF;--blue-mid:#3B6EFF;--blue-dark:#1040CC;--blue-soft:#EEF3FF;--blue-soft2:#DCE8FF;--cyan:#0AACFF;--bg:#F4F7FF;--bg2:#EAF0FF;--surface:#FFFFFF;--surface2:#F0F5FF;--border:#D6E2FF;--text:#1E2D50;--text-mid:#4A5E87;--text-dim:#8A9BBF;--white:#FFFFFF;--radius:18px;--radius-sm:10px;--shadow-card:0 4px 24px rgba(26,86,255,.08);--shadow-blue:0 12px 40px rgba(26,86,255,.22);--transition:all .38s cubic-bezier(.4,0,.2,1)}
        .landing-shell section[id]{scroll-margin-top:96px}
        .mobile-only{display:none}
        .hero-title-accent{background:linear-gradient(120deg,var(--blue) 0%,var(--cyan) 100%);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite}
        .cursor{display:inline-block;width:3px;height:.85em;background:var(--blue);margin-left:3px;vertical-align:middle;animation:blink .65s step-end infinite}
        .reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
        .reveal-left{opacity:0;transform:translateX(-36px);transition:opacity .7s ease,transform .7s ease}
        .reveal-right{opacity:0;transform:translateX(36px);transition:opacity .7s ease,transform .7s ease}
        .reveal.visible,.reveal-left.visible,.reveal-right.visible{opacity:1;transform:none}
        [data-delay='1']{transition-delay:.1s}[data-delay='2']{transition-delay:.2s}[data-delay='3']{transition-delay:.3s}[data-delay='4']{transition-delay:.4s}[data-delay='5']{transition-delay:.5s}
        .hero-badge,.hero-copy h1,.hero-copy p,.hero-actions,.hero-stats{opacity:0;transform:translateY(22px);animation:fadeUp .8s ease forwards}
        .hero-badge{animation-delay:.2s}.hero-copy h1{animation-delay:.4s}.hero-copy p{animation-delay:.6s}.hero-actions{animation-delay:.8s}.hero-stats{animation-delay:1s}
        .hero-visual-enter{opacity:0;transform:translateX(45px) scale(.96);animation:slideIn .9s ease forwards .5s}
        .badge-dot{animation:pulseDot 2s ease-in-out infinite}
        .blob-drift{animation:blobDrift 10s ease-in-out infinite alternate}
        .orb-float{animation:orbF 6s ease-in-out infinite}
        .hero-ring{animation:spin 28s linear infinite}.hero-ring-secondary{animation:spin 20s linear infinite reverse}
        .float-card{animation:fcFloat 5s ease-in-out infinite}.float-card:nth-of-type(2){animation-duration:6.5s;animation-direction:alternate-reverse}.float-card:nth-of-type(3){animation-duration:7s;animation-delay:.8s}
        @media (max-width:1024px){.mobile-only{display:block}.hero-copy p{max-width:unset}}
        @media (max-width:768px){.landing-shell section[id]{scroll-margin-top:84px}}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}@keyframes slideIn{to{opacity:1;transform:translateX(0) scale(1)}}@keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.7);opacity:.4}}@keyframes blink{50%{opacity:0}}@keyframes blobDrift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(28px,20px) scale(1.1)}}@keyframes orbF{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes fcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
      `}</style>
      <header className={`fixed inset-x-0 top-0 z-50 h-[66px] border-b transition-[var(--transition)] ${scrolled ? 'border-[var(--border)] bg-[rgba(255,255,255,0.97)] shadow-[0_2px_20px_rgba(26,86,255,0.08)]' : 'border-[var(--border)] bg-[rgba(244,247,255,0.88)] backdrop-blur-[18px]'}`}>
        <nav className="mx-auto flex h-full w-[min(calc(100%-2rem),1200px)] items-center justify-between gap-4">
          <a href="#hero" className="flex items-center gap-[9px] text-[1.1rem] font-extrabold text-[var(--blue)]">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--blue)] text-white">
              <Monitor className="h-4 w-4" />
            </span>
            <span className={headingFontClass}>Kursus Komputer</span>
          </a>
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-[0.9rem] font-medium text-[var(--text-mid)] transition-colors hover:text-[var(--blue)]">
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="rounded-[8px] border border-[var(--border)] px-[1.1rem] py-[0.45rem] text-[0.88rem] font-semibold text-[var(--text-mid)] transition-[var(--transition)] hover:border-[var(--blue)] hover:text-[var(--blue)]">
              Masuk
            </Link>
            <Link href="/register" className="rounded-[10px] bg-[var(--blue)] px-[1.3rem] py-[0.5rem] text-[0.88rem] font-bold text-white transition-[var(--transition)] hover:-translate-y-px hover:bg-[var(--blue-mid)] hover:shadow-[var(--shadow-blue)]">
              Daftar Sekarang
            </Link>
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white/80 text-[var(--text)] lg:hidden" aria-label="Buka menu">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 top-[66px] z-40 flex flex-col items-center justify-center gap-10 bg-white lg:hidden">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`${headingFontClass} text-[1.7rem] font-bold text-[var(--text)] transition-colors hover:text-[var(--blue)]`}>
              {item.label}
            </a>
          ))}
          <Link href="/register" onClick={() => setMenuOpen(false)} className="rounded-xl bg-[var(--blue)] px-8 py-4 text-[0.95rem] font-bold text-white">
            Daftar Sekarang
          </Link>
        </div>
      ) : null}

      <main>
        <section id="hero" className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#edf3ff_0%,#e0ebff_40%,#f5f8ff_100%)] px-4 pb-16 pt-[104px] sm:px-6 sm:pb-20 sm:pt-[110px] lg:px-8">
          <div className="blob-drift absolute -right-[100px] -top-[140px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(26,86,255,0.2),transparent_70%)]" />
          <div className="blob-drift absolute -bottom-[100px] -left-[80px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(10,172,255,0.15),transparent_70%)] [animation-delay:4s]" />
          <div className="blob-drift absolute left-[18%] top-[30%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(26,86,255,0.1),transparent_70%)] [animation-delay:2s]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(26,86,255,0.18)_1.2px,transparent_1.2px)] bg-[length:34px_34px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
          <div className="orb-float absolute left-[7%] top-[22%] h-[18px] w-[18px] rounded-full bg-[var(--blue)] opacity-20" />
          <div className="orb-float absolute left-[13%] top-[58%] h-[11px] w-[11px] rounded-full bg-[var(--cyan)] opacity-30 [animation-delay:2s] [animation-duration:8s]" />
          <div className="orb-float absolute right-[11%] top-[32%] h-[14px] w-[14px] rounded-full bg-[var(--blue-mid)] opacity-[0.18] [animation-delay:1s] [animation-duration:7s]" />
          <div className="orb-float absolute bottom-[22%] right-[16%] h-[8px] w-[8px] rounded-full bg-[var(--cyan)] opacity-35 [animation-delay:3s] [animation-duration:5s]" />

          <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 lg:gap-16 xl:grid-cols-2">
            <div className="hero-copy">
              <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[rgba(26,86,255,0.25)] bg-[rgba(26,86,255,0.1)] px-4 py-2 text-[0.8rem] font-bold text-[var(--blue)]">
                <span className="badge-dot h-[7px] w-[7px] rounded-full bg-[var(--cyan)]" />
                Platform Kursus Komputer Terpercaya
              </div>
              <h1 className={`${headingFontClass} mt-5 text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold leading-[1.1] text-[var(--text)]`}>
                Kuasai <span className="hero-title-accent">{typedWord}</span><span className="cursor" /><br />
                Untuk Masa Depanmu
              </h1>
              <p className="mt-6 max-w-[520px] text-[0.98rem] leading-7 text-[var(--text-mid)] sm:text-[1.05rem] sm:leading-8">
                Kelas komputer yang membantu siswa dan umum naik level lebih cepat. Mulai dari Office, desain, AI, sampai website, semua dirancang praktis, ramah pemula, dan langsung bisa dipakai.
              </p>
              <div className="hero-actions mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:gap-4">
                <Link href="/register" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-white shadow-[0_6px_28px_rgba(26,86,255,0.35)] transition-[var(--transition)] hover:-translate-y-0.5 hover:bg-[var(--blue-mid)] hover:shadow-[0_14px_40px_rgba(26,86,255,0.45)]">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#programs" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-[var(--blue)] transition-[var(--transition)] hover:-translate-y-0.5 hover:bg-[var(--blue-soft)]">
                  Lihat Program
                </a>
              </div>
              <div className="hero-stats mt-9 grid grid-cols-1 gap-3 sm:mt-11 sm:grid-cols-3 sm:gap-5">
                <div className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 backdrop-blur-sm"><div className={`${headingFontClass} text-[1.65rem] font-extrabold text-[var(--blue)]`}>{counters.programs}+</div><div className="text-[0.8rem] text-[var(--text-dim)]">Program Kursus</div></div>
                <div className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 backdrop-blur-sm"><div className={`${headingFontClass} text-[1.65rem] font-extrabold text-[var(--blue)]`}>{counters.students}+</div><div className="text-[0.8rem] text-[var(--text-dim)]">Siswa Aktif</div></div>
                <div className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 backdrop-blur-sm"><div className={`${headingFontClass} text-[1.65rem] font-extrabold text-[var(--blue)]`}>{counters.satisfaction}%</div><div className="text-[0.8rem] text-[var(--text-dim)]">Kepuasan Siswa</div></div>
              </div>
              <div className="mobile-only mt-8 grid gap-3 md:hidden">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 shadow-[var(--shadow-card)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]"><Trophy className="h-4 w-4" /></span>
                  <div><strong className="block text-[0.82rem] font-bold text-[var(--text)]">Sertifikat Resmi</strong><span className="text-[0.72rem] text-[var(--text-dim)]">Siap untuk portofolio</span></div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 shadow-[var(--shadow-card)]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff7ed] text-[#f59e0b]"><Star className="h-4 w-4 fill-current" /></span>
                  <div><strong className="block text-[0.82rem] font-bold text-[var(--text)]">Belajar Lebih Meyakinkan</strong><span className="text-[0.72rem] text-[var(--text-dim)]">Kelas kecil, progres lebih terasa</span></div>
                </div>
              </div>
            </div>

            <div className="hero-visual-enter relative hidden xl:block">
              <div className="hero-ring absolute left-1/2 top-1/2 h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[rgba(26,86,255,0.2)]" />
              <div className="hero-ring-secondary absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgba(10,172,255,0.18)]" />
              <div className="relative overflow-hidden rounded-[26px] shadow-[0_30px_80px_rgba(26,86,255,0.18),0_0_0_1px_rgba(26,86,255,0.1)]">
                <Image src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=560&q=80&auto=format&fit=crop" alt="Belajar komputer" width={560} height={430} className="h-[430px] w-full object-cover transition-transform duration-700 hover:scale-[1.04]" priority />
              </div>
              <div className="float-card absolute -top-5 right-[12%] flex items-center gap-3 rounded-[14px] border border-[rgba(26,86,255,0.14)] bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[0_8px_30px_rgba(26,86,255,0.12)] backdrop-blur-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--blue-soft)] text-[var(--blue)]"><Trophy className="h-4 w-4" /></span>
                <div><strong className="block text-[0.78rem] font-bold text-[var(--text)]">Sertifikat Resmi</strong><span className="text-[0.68rem] text-[var(--text-dim)]">Diakui industri</span></div>
              </div>
              <div className="float-card absolute bottom-[8%] left-[-58px] flex items-center gap-3 rounded-[14px] border border-[rgba(26,86,255,0.14)] bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[0_8px_30px_rgba(26,86,255,0.12)] backdrop-blur-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#fff7ed] text-[#f59e0b]"><Star className="h-4 w-4 fill-current" /></span>
                <div><strong className="block text-[0.78rem] font-bold text-[var(--text)]">4.9 Rating</strong><span className="text-[0.68rem] text-[var(--text-dim)]">500+ ulasan</span></div>
              </div>
              <div className="float-card absolute right-[-58px] top-[36%] flex items-center gap-3 rounded-[14px] border border-[rgba(26,86,255,0.14)] bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[0_8px_30px_rgba(26,86,255,0.12)] backdrop-blur-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#f0fdf4] text-[#10b981]"><GraduationCap className="h-4 w-4" /></span>
                <div><strong className="block text-[0.78rem] font-bold text-[var(--text)]">Kelas Baru</strong><span className="text-[0.68rem] text-[var(--text-dim)]">AI & ChatGPT</span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="why" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="reveal text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Kenapa Kami?</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Belajar Lebih Efektif & Menyenangkan</h2>
              <p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">Bukan sekadar ikut kelas, siswa dibimbing supaya cepat paham, cepat praktik, dan lebih percaya diri memakai skill digital di sekolah maupun kerja.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {[
                ['Kurikulum Up-to-Date', 'Materi selalu diperbarui sesuai kebutuhan industri dan perkembangan teknologi terkini.', <Sparkles className="h-5 w-5" key="a" />],
                ['Instruktur Berpengalaman', 'Diajar oleh instruktur profesional yang sabar dan berpengalaman di bidangnya.', <Presentation className="h-5 w-5" key="b" />],
                ['Kelas Kecil & Kondusif', 'Maksimal 8 siswa per kelas agar setiap siswa mendapat perhatian penuh.', <ShieldCheck className="h-5 w-5" key="c" />],
                ['Dashboard Digital', 'Pantau absensi, progres belajar, dan tagihan iuran langsung dari dashboard siswa.', <LayoutDashboard className="h-5 w-5" key="d" />],
                ['Harga Terjangkau', 'Mulai dari Rp 15.000 per pertemuan dengan skema iuran yang ringan dan jelas.', <Wallet className="h-5 w-5" key="e" />],
                ['Sertifikat Resmi', 'Dapatkan sertifikat kelulusan setelah menyelesaikan program kursus yang diikuti.', <GraduationCap className="h-5 w-5" key="f" />],
              ].map(([title, desc, icon], index) => (
                <article key={title as string} data-delay={`${(index % 5) + 1}`} className="reveal group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-8 shadow-[var(--shadow-card)] transition-[var(--transition)] hover:-translate-y-1.5 hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]">
                  <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)] transition-[var(--transition)] group-hover:scale-105 group-hover:bg-[var(--blue)] group-hover:text-white">{icon}</div>
                  <h3 className={`${headingFontClass} text-[1.05rem] font-bold text-[var(--text)]`}>{title}</h3>
                  <p className="mt-3 text-[0.88rem] leading-7 text-[var(--text-mid)]">{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="programs" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="reveal">
                <div className="mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Program Kami</div>
                <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Program Kursus</h2>
              </div>
              <div className="reveal flex flex-wrap gap-2">
                {(['all', 'dasar', 'office', 'desain', 'ai'] as const).map((tab) => (
                  <button key={tab} type="button" onClick={() => setFilter(tab)} className={`rounded-full border px-4 py-2 text-[0.82rem] font-bold transition-[var(--transition)] ${filter === tab ? 'border-[var(--blue)] bg-[var(--blue)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-mid)] hover:border-[var(--blue)] hover:bg-[var(--blue)] hover:text-white'}`}>
                    {tab === 'all' ? 'Semua' : tab === 'office' ? 'Office' : tab === 'desain' ? 'Desain' : tab === 'ai' ? 'AI' : 'Dasar'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
              {filteredPrograms.map((program, index) => (
                <article key={program.title} data-delay={`${(index % 4) + 1}`} className="reveal group overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-white transition-[var(--transition)] hover:-translate-y-1.5 hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]">
                  <div className="relative h-[155px] overflow-hidden">
                    <Image src={program.image} alt={program.title} width={300} height={155} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,45,80,0.45),transparent_60%)]" />
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--blue)] px-3 py-1 text-[0.7rem] font-extrabold text-white">{program.badge}</span>
                  </div>
                  <div className="p-5">
                    <h3 className={`${headingFontClass} text-[0.98rem] font-bold text-[var(--text)]`}>{program.icon} {program.title}</h3>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[0.75rem] text-[var(--text-dim)]">{program.level}</span>
                      <span className="text-[0.75rem] font-bold text-[var(--blue)]">{program.sessions} sesi</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                      <div><span className={`${headingFontClass} text-[0.95rem] font-extrabold text-[var(--text)]`}>{program.price}</span><span className="ml-1 text-[0.7rem] text-[var(--text-dim)]">/ sesi</span></div>
                      <Link href="/register" className="rounded-lg bg-[var(--blue-soft)] px-4 py-2 text-[0.78rem] font-bold text-[var(--blue)] transition-[var(--transition)] hover:bg-[var(--blue)] hover:text-white">Daftar</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="showcase" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1200px] items-center gap-16 xl:grid-cols-2">
            <div className="reveal-left grid grid-cols-2 gap-4">
              {SHOWCASE_IMAGES.map((image, index) => (
                <div key={image} className={`overflow-hidden rounded-2xl border border-[var(--border)] transition-[var(--transition)] hover:shadow-[var(--shadow-blue)] ${index === 1 ? 'mt-9 h-[190px]' : index === 2 ? '-mt-9 h-[190px]' : 'h-[190px]'}`}>
                  <Image src={image} alt="Fasilitas belajar kursus komputer" width={300} height={190} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                </div>
              ))}
            </div>
            <div className="reveal-right">
              <div className="mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Fasilitas</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Lingkungan Belajar yang Nyaman & Produktif</h2>
              <p className="mt-5 text-[0.93rem] leading-8 text-[var(--text-mid)]">Fasilitas komputer lengkap, internet cepat, dan ruang kondusif agar siswa bisa fokus berkembang dari dasar sampai siap pakai.</p>
              <div className="mt-7 grid gap-4">
                {['Komputer spesifikasi terbaru dan software lengkap', 'WiFi berkecepatan tinggi untuk kebutuhan praktik', 'Materi bisa diunduh kapan saja setelah kelas', 'Jadwal fleksibel: pagi, siang, atau sore hari', 'Support dan diskusi aktif via grup WhatsApp'].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--blue-soft)] text-[var(--blue)]"><Check className="h-3.5 w-3.5" /></span>
                    <span className="text-[0.92rem] text-[var(--text-mid)]">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-white shadow-[0_6px_28px_rgba(26,86,255,0.35)] transition-[var(--transition)] hover:-translate-y-0.5 hover:bg-[var(--blue-mid)]">
                Mulai Belajar Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="reveal text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Harga</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Harga Terjangkau</h2>
              <p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">Struktur harga dibuat ringan agar siswa bisa mulai dulu tanpa beban besar, tapi tetap mendapatkan pengalaman belajar yang rapi dan serius.</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {[
                { title: 'Pelajar SMP', price: 'Rp 15.000', note: 'Per pertemuan (60 menit)', cta: 'Daftar Sekarang', popular: false },
                { title: 'Pelajar SMA', price: 'Rp 20.000', note: 'Per pertemuan (60 menit)', cta: 'Daftar Sekarang', popular: true },
                { title: 'Umum / Luar Sekolah', price: 'Fleksibel', note: 'Sesuai kesepakatan dengan admin', cta: 'Hubungi Admin', popular: false },
              ].map((plan, index) => (
                <article key={plan.title} data-delay={`${index + 1}`} className={`reveal relative rounded-[var(--radius)] border p-9 transition-[var(--transition)] ${plan.popular ? 'scale-[1.04] border-[var(--blue)] bg-[linear-gradient(145deg,#1A56FF_0%,#3B6EFF_100%)] shadow-[0_30px_70px_rgba(26,86,255,0.3)] max-md:scale-100' : 'border-[var(--border)] bg-white hover:-translate-y-1.5 hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]'}`}>
                  {plan.popular ? <div className="absolute left-1/2 top-[-16px] -translate-x-1/2 rounded-full bg-white px-4 py-1 text-[0.73rem] font-extrabold text-[var(--blue)] shadow-[0_4px_14px_rgba(26,86,255,0.2)]">Paling Diminati</div> : null}
                  <div className={`text-[0.8rem] font-bold uppercase tracking-[0.1em] ${plan.popular ? 'text-white/80' : 'text-[var(--text-dim)]'}`}>{plan.title}</div>
                  <div className={`${headingFontClass} mt-4 text-[2.3rem] font-extrabold ${plan.popular ? 'text-white' : 'text-[var(--text)]'}`}>{plan.price}</div>
                  <div className={`mt-2 text-[0.82rem] ${plan.popular ? 'text-white/80' : 'text-[var(--text-dim)]'}`}>{plan.note}</div>
                  <div className="mt-8 grid gap-3">
                    {['11 program tersedia', 'Materi dan download', 'Absensi digital', 'Dashboard siswa', plan.popular ? 'Sertifikat kelulusan' : 'Support admin aktif'].map((feature) => (
                      <div key={feature} className={`flex items-center gap-3 text-[0.88rem] ${plan.popular ? 'text-white' : 'text-[var(--text-mid)]'}`}>
                        <Check className={`h-4 w-4 ${plan.popular ? 'text-white' : 'text-[var(--blue)]'}`} />
                        {feature}
                      </div>
                    ))}
                  </div>
                  <Link href={plan.cta === 'Hubungi Admin' ? '#cta' : '/register'} className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-[0.92rem] font-bold transition-[var(--transition)] ${plan.popular ? 'bg-white text-[var(--blue)] shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)]' : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}`}>
                    {plan.cta}
                  </Link>
                </article>
              ))}
            </div>
            <p className="reveal mt-8 text-center text-[0.78rem] text-[var(--text-dim)]">Harga dapat berubah sesuai kebijakan lembaga. Histori tagihan tersimpan aman di sistem.</p>
          </div>
        </section>

        <section id="flow" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="reveal text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Cara Daftar</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Alur Pendaftaran</h2>
              <p className="mx-auto mt-4 max-w-[580px] text-base leading-7 text-[var(--text-dim)]">Prosesnya singkat, jelas, dan tidak bikin bingung bahkan untuk orang tua atau siswa yang baru pertama kali daftar kursus.</p>
            </div>
            <div className="relative mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
              <div className="pointer-events-none absolute left-[10%] right-[10%] top-[30px] hidden h-[2px] bg-[linear-gradient(to_right,transparent,rgba(26,86,255,0.35),transparent)] xl:block" />
              {[
                ['Buat Akun', 'Daftar dengan email Anda secara gratis.', <MonitorCog className="h-6 w-6" key="1" />],
                ['Isi Formulir', 'Lengkapi data diri dan pilih program.', <Presentation className="h-6 w-6" key="2" />],
                ['Verifikasi Admin', 'Admin mereview pendaftaran Anda.', <ShieldCheck className="h-6 w-6" key="3" />],
                ['Mulai Belajar', 'Ikuti kelas sesuai jadwal.', <Bot className="h-6 w-6" key="4" />],
                ['Pantau Progress', 'Akses materi, absensi, dan iuran.', <LayoutDashboard className="h-6 w-6" key="5" />],
              ].map((step, index) => (
                <article key={step[0] as string} data-delay={`${index + 1}`} className="reveal relative z-10 flex flex-col items-center text-center">
                  <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--bg)] text-[var(--blue)] transition-[var(--transition)] hover:scale-[1.12] hover:border-[var(--blue)] hover:bg-[var(--blue)] hover:text-white hover:shadow-[0_0_0_8px_rgba(26,86,255,0.1)]">{step[2]}</div>
                  <h3 className={`${headingFontClass} mt-5 text-[0.9rem] font-bold text-[var(--text)]`}>{step[0]}</h3>
                  <p className="mt-2 text-[0.78rem] leading-6 text-[var(--text-dim)]">{step[1]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="reveal text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">Kata Mereka</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Pengalaman Nyata Siswa Kami</h2>
              <p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">Hasil belajar paling terasa saat siswa mulai lebih cepat menyelesaikan tugas, lebih rapi presentasi, dan lebih percaya diri memakai komputer.</p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {TESTIMONIALS.map((item, index) => (
                <article key={item.name} data-delay={`${(index % 3) + 1}`} className="reveal rounded-[var(--radius)] border border-[var(--border)] bg-white p-7 transition-[var(--transition)] hover:-translate-y-1.5 hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]">
                  <div className="mb-4 flex text-[#fbbf24]">
                    {Array.from({ length: 5 }).map((_, starIndex) => <Star key={`${item.name}-${starIndex}`} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="min-h-28 text-[0.92rem] italic leading-7 text-[var(--text-mid)]">&quot;{item.quote}&quot;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} ${headingFontClass} text-base font-extrabold text-white`}>{item.initial}</div>
                    <div><strong className="block text-[0.88rem] font-bold text-[var(--text)]">{item.name}</strong><span className="text-[0.75rem] text-[var(--text-dim)]">{item.role}</span></div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="faq" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[740px]">
            <div className="reveal text-center">
              <div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">FAQ</div>
              <h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>Pertanyaan Umum</h2>
            </div>
            <div className="mt-12 grid gap-4">
              {FAQS.map(([question, answer], index) => {
                const isOpen = openFaq === index
                return (
                  <article key={question} className={`reveal overflow-hidden rounded-[var(--radius-sm)] border transition-colors ${isOpen ? 'border-[var(--blue)] bg-white' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
                    <button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.93rem] font-semibold text-[var(--text)]">
                      <span>{question}</span>
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-[var(--transition)] ${isOpen ? 'rotate-180 bg-[var(--blue)] text-white' : 'bg-[var(--blue-soft)] text-[var(--blue)]'}`}>
                        <ChevronDown className="h-4 w-4" />
                      </span>
                    </button>
                    <div className="overflow-hidden transition-[max-height] duration-500 ease-out" style={{ maxHeight: isOpen ? 300 : 0 }}>
                      <p className="px-6 pb-5 text-[0.88rem] leading-7 text-[var(--text-mid)]">{answer}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="cta" className="bg-[var(--bg)] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[880px]">
            <div className="reveal relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--blue)_0%,#0A8FE8_50%,var(--blue-mid)_100%)] px-6 py-16 text-center shadow-[0_40px_100px_rgba(26,86,255,0.3)] sm:px-12">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:28px_28px]" />
              <div className="relative z-10">
                <h2 className={`${headingFontClass} text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight text-white`}>Siap Memulai Perjalananmu?</h2>
                <p className="mx-auto mt-5 max-w-[520px] text-base leading-7 text-white/80">Kalau Anda sedang mencari tempat belajar komputer yang rapi, ramah, dan hasilnya terasa, ini saat yang tepat untuk mulai. Sesi percobaan pertama gratis.</p>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                  <Link href="/register" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-[0.95rem] font-extrabold text-[var(--blue)] transition-[var(--transition)] hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                    Daftar Gratis Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-white/50 px-8 py-3 text-[0.95rem] font-bold text-white transition-[var(--transition)] hover:bg-white/15 hover:border-white">
                    <MessageCircle className="h-4 w-4" />
                    Chat WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--text)] px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 grid gap-12 md:grid-cols-2 xl:grid-cols-[1.5fr,1fr,1fr,1.2fr]">
            <div>
              <div className="mb-4 flex items-center gap-3 text-white">
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--blue)] text-white"><Monitor className="h-4 w-4" /></span>
                <span className={`${headingFontClass} text-[1.1rem] font-extrabold`}>Kursus Komputer</span>
              </div>
              <p className="max-w-sm text-[0.85rem] leading-7 text-white/45">Platform edukasi digital untuk belajar komputer secara praktis, terstruktur, dan ramah pemula.</p>
              <div className="mt-5 flex gap-2">
                {[<Sparkles key="ig" className="h-4 w-4" />, <Monitor key="fb" className="h-4 w-4" />, <Presentation key="yt" className="h-4 w-4" />, <Bot key="tt" className="h-4 w-4" />].map((icon, index) => (
                  <a key={index} href="#hero" className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/12 bg-white/8 text-white transition-[var(--transition)] hover:bg-[var(--blue)] hover:border-[var(--blue)]">{icon}</a>
                ))}
              </div>
            </div>
            <div>
              <h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>Navigasi</h3>
              <div className="grid gap-3 text-[0.85rem] text-white/45">
                <a href="#programs" className="transition-colors hover:text-white">Program Kursus</a>
                <a href="#pricing" className="transition-colors hover:text-white">Harga</a>
                <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
                <Link href="/login" className="transition-colors hover:text-white">Masuk</Link>
                <Link href="/register" className="transition-colors hover:text-white">Daftar</Link>
              </div>
            </div>
            <div>
              <h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>Program</h3>
              <div className="grid gap-3 text-[0.85rem] text-white/45">
                <a href="#programs" className="transition-colors hover:text-white">Dasar Komputer</a>
                <a href="#programs" className="transition-colors hover:text-white">Microsoft Office</a>
                <a href="#programs" className="transition-colors hover:text-white">Desain Grafis</a>
                <a href="#programs" className="transition-colors hover:text-white">AI & ChatGPT</a>
                <a href="#programs" className="transition-colors hover:text-white">Pembuatan Website</a>
              </div>
            </div>
            <div>
              <h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>Hubungi Kami</h3>
              <div className="grid gap-4 text-[0.85rem] text-white/45">
                <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>+62 812-3456-7890</span></div>
                <div className="flex items-start gap-3"><Monitor className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>info@kursuskomputer.id</span></div>
                <div className="flex items-start gap-3"><Code2 className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>Jl. Pendidikan No. 1, Kota Anda</span></div>
                <div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>Senin - Sabtu, 08.00 - 17.00 WIB</span></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.8rem] text-white/30 md:flex-row md:items-center md:justify-between">
            <span>{'\u00A9'} 2026 Kursus Komputer. Semua hak dilindungi.</span>
            <div className="flex gap-6">
              <a href="#hero" className="transition-colors hover:text-white">Kebijakan Privasi</a>
              <a href="#hero" className="transition-colors hover:text-white">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
