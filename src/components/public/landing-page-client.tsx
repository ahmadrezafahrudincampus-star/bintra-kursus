'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LucideIcon,
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
  Users,
  Wallet,
  X,
} from 'lucide-react'
import type { LandingContent, LandingFooterLink } from '@/lib/landing-content'

type LandingPageClientProps = {
  bodyFontClass: string
  headingFontClass: string
  content: LandingContent
}

const ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  'code-2': Code2,
  'graduation-cap': GraduationCap,
  heart: Heart,
  'layout-dashboard': LayoutDashboard,
  monitor: Monitor,
  'monitor-cog': MonitorCog,
  phone: Phone,
  presentation: Presentation,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  star: Star,
  trophy: Trophy,
  users: Users,
  wallet: Wallet,
}

function resolveIcon(icon: string) {
  return ICONS[icon.toLowerCase()] ?? Sparkles
}

function isExternalUrl(url: string) {
  return url.startsWith('http://') || url.startsWith('https://')
}

function HrefRenderer({
  target,
  className,
  children,
  onClick,
}: {
  target: string
  className: string
  children: ReactNode
  onClick?: () => void
}) {
  if (target.startsWith('#')) {
    return (
      <a href={target} className={className} onClick={onClick}>
        {children}
      </a>
    )
  }

  if (isExternalUrl(target)) {
    return (
      <a href={target} className={className} target="_blank" rel="noreferrer" onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <Link href={target} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}

function LogoMark({ content, headingFontClass }: { content: LandingContent; headingFontClass: string }) {
  if (content.navbar_logo_image_url) {
    return (
      <span className="flex items-center gap-[9px] text-[1.1rem] font-extrabold text-[var(--blue)]">
        <span className="relative h-[32px] w-[32px] overflow-hidden rounded-[8px] bg-[var(--blue-soft)]">
          <Image
            src={content.navbar_logo_image_url}
            alt={content.navbar_logo_image_alt || content.navbar_logo_text}
            fill
            className="object-cover"
          />
        </span>
        <span className={headingFontClass}>{content.navbar_logo_text}</span>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-[9px] text-[1.1rem] font-extrabold text-[var(--blue)]">
      <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] bg-[var(--blue)] text-white">
        <Monitor className="h-4 w-4" />
      </span>
      <span className={headingFontClass}>{content.navbar_logo_text}</span>
    </span>
  )
}

export function LandingPageClient({ bodyFontClass, headingFontClass, content }: LandingPageClientProps) {
  const [filter, setFilter] = useState('all')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [counters, setCounters] = useState<Record<string, number>>({})

  const navLinks = useMemo(() => content.navigation_items.filter((item) => item.is_active && !item.is_button), [content.navigation_items])
  const navButtons = useMemo(() => content.navigation_items.filter((item) => item.is_active && item.is_button), [content.navigation_items])
  const activePrograms = useMemo(() => content.program_items.filter((item) => item.is_active), [content.program_items])
  const categories = useMemo(() => Array.from(new Set(activePrograms.map((item) => item.category.trim()).filter(Boolean))), [activePrograms])
  const filteredPrograms = useMemo(() => (filter === 'all' ? activePrograms : activePrograms.filter((item) => item.category === filter)), [activePrograms, filter])
  const activeStats = useMemo(() => content.stats_items.filter((item) => item.is_active), [content.stats_items])
  const activeWhyItems = useMemo(() => content.why_items.filter((item) => item.is_active), [content.why_items])
  const activeShowcaseImages = useMemo(() => content.showcase_images.filter((item) => item.is_active), [content.showcase_images])
  const activePlans = useMemo(() => content.pricing_plans.filter((item) => item.is_active), [content.pricing_plans])
  const activeFlowSteps = useMemo(() => content.flow_steps.filter((item) => item.is_active), [content.flow_steps])
  const activeTestimonials = useMemo(() => content.testimonials_items.filter((item) => item.is_active), [content.testimonials_items])
  const activeFaqItems = useMemo(() => content.faq_items.filter((item) => item.is_active), [content.faq_items])
  const activeSocialLinks = useMemo(() => content.social_links.filter((item) => item.is_active), [content.social_links])
  const quickLinks = useMemo(() => content.footer_quick_links.filter((item) => item.is_active), [content.footer_quick_links])
  const footerProgramLinks = useMemo(() => {
    const links = content.footer_program_links.filter((item) => item.is_active)
    return links.length > 0
      ? links
      : activePrograms.slice(0, 5).map<LandingFooterLink>((item, index) => ({
          label: item.title,
          url: '#programs',
          sort_order: index + 1,
          is_active: true,
        }))
  }, [activePrograms, content.footer_program_links])
  const activeFloatingCards = useMemo(() => content.hero_floating_cards.filter((item) => item.is_active), [content.hero_floating_cards])

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

    document.querySelectorAll<HTMLElement>('.reveal, .reveal-left, .reveal-right').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [filteredPrograms])

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero || activeStats.length === 0) return

    let started = false
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || started) return
          started = true
          const current = Object.fromEntries(activeStats.map((item) => [item.label, 0]))
          const timer = window.setInterval(() => {
            let done = true
            activeStats.forEach((item) => {
              const next = Math.min((current[item.label] ?? 0) + Math.max(1, Math.ceil(item.value / 60)), item.value)
              current[item.label] = next
              if (next !== item.value) done = false
            })
            setCounters({ ...current })
            if (done) window.clearInterval(timer)
          }, 20)
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(hero)
    return () => observer.disconnect()
  }, [activeStats])

  const BadgeIcon = resolveIcon(content.hero_badge_icon)

  return (
    <div className={`${bodyFontClass} landing-shell min-h-screen overflow-x-hidden bg-[var(--bg)] text-[var(--text)]`}>
      <style jsx global>{`
        :root{--blue:#1A56FF;--blue-mid:#3B6EFF;--cyan:#0AACFF;--bg:#F4F7FF;--surface:#FFFFFF;--border:#D6E2FF;--text:#1E2D50;--text-mid:#4A5E87;--text-dim:#8A9BBF;--radius:18px;--radius-sm:10px;--shadow-card:0 4px 24px rgba(26,86,255,.08);--shadow-blue:0 12px 40px rgba(26,86,255,.22);--transition:all .38s cubic-bezier(.4,0,.2,1)}
        .landing-shell section[id]{scroll-margin-top:96px}.mobile-only{display:none}.hero-title-accent{background:linear-gradient(120deg,var(--blue) 0%,var(--cyan) 100%);background-size:200% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 3s linear infinite}.hero-title-static{display:inline-block;min-width:320px;white-space:nowrap}.reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}.reveal-left{opacity:0;transform:translateX(-36px);transition:opacity .7s ease,transform .7s ease}.reveal-right{opacity:0;transform:translateX(36px);transition:opacity .7s ease,transform .7s ease}.reveal.visible,.reveal-left.visible,.reveal-right.visible{opacity:1;transform:none}.hero-badge,.hero-copy h1,.hero-copy p,.hero-actions,.hero-stats{opacity:0;transform:translateY(22px);animation:fadeUp .8s ease forwards}.hero-badge{animation-delay:.2s}.hero-copy h1{animation-delay:.4s}.hero-copy p{animation-delay:.6s}.hero-actions{animation-delay:.8s}.hero-stats{animation-delay:1s}.hero-visual-enter{opacity:0;transform:translateX(45px) scale(.96);animation:slideIn .9s ease forwards .5s}.faq-answer{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;padding:0 1.5rem}.faq-item-open .faq-answer{max-height:300px;padding:.15rem 1.5rem 1.25rem}.faq-icon{display:inline-block;transition:transform .3s ease}.faq-item-open .faq-icon{transform:rotate(45deg)}.blob-drift{animation:blobDrift 10s ease-in-out infinite alternate}.orb-float{animation:orbF 6s ease-in-out infinite}.hero-ring{animation:spin 28s linear infinite}.hero-ring-secondary{animation:spin 20s linear infinite reverse}.float-card{animation:fcFloat 5s ease-in-out infinite}
        @media (max-width:1024px){.mobile-only{display:block}.hero-copy p{max-width:unset}}@media (max-width:768px){.landing-shell section[id]{scroll-margin-top:84px}.hero-title-static{min-width:0;white-space:normal}}
        @keyframes fadeUp{to{opacity:1;transform:translateY(0)}}@keyframes slideIn{to{opacity:1;transform:translateX(0) scale(1)}}@keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}@keyframes blobDrift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(28px,20px) scale(1.1)}}@keyframes orbF{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}@keyframes spin{to{transform:translate(-50%,-50%) rotate(360deg)}}@keyframes fcFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-11px)}}
      `}</style>

      <header className={`fixed inset-x-0 top-0 z-50 h-[66px] border-b transition-[var(--transition)] ${scrolled ? 'border-[var(--border)] bg-[rgba(255,255,255,0.97)] shadow-[0_2px_20px_rgba(26,86,255,0.08)]' : 'border-[var(--border)] bg-[rgba(244,247,255,0.88)] backdrop-blur-[18px]'}`}>
        <nav className="mx-auto flex h-full w-[min(calc(100%-2rem),1200px)] items-center justify-between gap-4">
          <a href="#hero"><LogoMark content={content} headingFontClass={headingFontClass} /></a>
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <HrefRenderer key={`${item.label}-${item.sort_order}`} target={item.target} className="text-[0.9rem] font-medium text-[var(--text-mid)] transition-colors hover:text-[var(--blue)]">{item.label}</HrefRenderer>
            ))}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            {navButtons.map((item) => (
              <HrefRenderer key={`${item.label}-${item.sort_order}`} target={item.target} className={item.variant === 'solid' ? 'rounded-[10px] bg-[var(--blue)] px-[1.3rem] py-[0.5rem] text-[0.88rem] font-bold text-white transition-[var(--transition)] hover:-translate-y-px hover:bg-[var(--blue-mid)] hover:shadow-[var(--shadow-blue)]' : 'rounded-[8px] border border-[var(--border)] px-[1.1rem] py-[0.45rem] text-[0.88rem] font-semibold text-[var(--text-mid)] transition-[var(--transition)] hover:border-[var(--blue)] hover:text-[var(--blue)]'}>{item.label}</HrefRenderer>
            ))}
          </div>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white/80 text-[var(--text)] lg:hidden" aria-label="Buka menu">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </nav>
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 top-[66px] z-40 flex flex-col items-center justify-center gap-8 bg-white lg:hidden">
          {navLinks.map((item) => (
            <HrefRenderer key={`${item.label}-mobile`} target={item.target} onClick={() => setMenuOpen(false)} className={`${headingFontClass} text-[1.7rem] font-bold text-[var(--text)] transition-colors hover:text-[var(--blue)]`}>{item.label}</HrefRenderer>
          ))}
          {navButtons.filter((item) => item.variant === 'solid').slice(0, 1).map((item) => (
            <HrefRenderer key={`${item.label}-mobile-button`} target={item.target} onClick={() => setMenuOpen(false)} className="rounded-xl bg-[var(--blue)] px-8 py-4 text-[0.95rem] font-bold text-white">{item.label}</HrefRenderer>
          ))}
        </div>
      ) : null}

      <main>
        <section id="hero" className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#edf3ff_0%,#e0ebff_40%,#f5f8ff_100%)] px-4 pb-16 pt-[104px] sm:px-6 sm:pb-20 sm:pt-[110px] lg:px-8">
          <div className="blob-drift absolute -right-[100px] -top-[140px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(26,86,255,0.2),transparent_70%)]" />
          <div className="blob-drift absolute -bottom-[100px] -left-[80px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(10,172,255,0.15),transparent_70%)]" />
          <div className="orb-float absolute left-[7%] top-[22%] h-[18px] w-[18px] rounded-full bg-[var(--blue)] opacity-20" />

          <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-10 lg:gap-16 xl:grid-cols-2">
            <div className="hero-copy">
              <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-[rgba(26,86,255,0.25)] bg-[rgba(26,86,255,0.1)] px-4 py-2 text-[0.8rem] font-bold text-[var(--blue)]"><BadgeIcon className="h-3.5 w-3.5" />{content.hero_badge}</div>
              <h1 className={`${headingFontClass} mt-5 text-[clamp(2.4rem,4.5vw,3.8rem)] font-extrabold leading-[1.1] text-[var(--text)]`}>{content.hero_title_prefix} <span className="hero-title-accent hero-title-static">{content.hero_title_accent}</span><br />{content.hero_title_suffix}</h1>
              <p className="mt-6 max-w-[520px] text-[0.98rem] leading-7 text-[var(--text-mid)] sm:text-[1.05rem] sm:leading-8">{content.hero_description}</p>
              <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <HrefRenderer target={content.hero_primary_cta_url} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-white shadow-[0_6px_28px_rgba(26,86,255,0.35)] transition-[var(--transition)] hover:-translate-y-0.5 hover:bg-[var(--blue-mid)]">{content.hero_primary_cta_text}<ArrowRight className="h-4 w-4" /></HrefRenderer>
                <HrefRenderer target={content.hero_secondary_cta_url} className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-[var(--blue)] transition-[var(--transition)] hover:bg-[var(--blue-soft)]">{content.hero_secondary_cta_text}</HrefRenderer>
              </div>
              <div className="hero-stats mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
                {activeStats.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-white/75 px-4 py-4 backdrop-blur-sm"><div className={`${headingFontClass} text-[1.65rem] font-extrabold text-[var(--blue)]`}>{counters[item.label] ?? 0}{item.suffix}</div><div className="text-[0.8rem] text-[var(--text-dim)]">{item.label}</div></div>
                ))}
              </div>
              <div className="mobile-only mt-8 grid gap-3 md:hidden">
                {activeFloatingCards.slice(0, 2).map((item) => {
                  const Icon = resolveIcon(item.icon)
                  return <div key={item.title} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-white/90 px-4 py-3 shadow-[var(--shadow-card)]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]"><Icon className="h-4 w-4" /></span><div><strong className="block text-[0.82rem] font-bold text-[var(--text)]">{item.title}</strong><span className="text-[0.72rem] text-[var(--text-dim)]">{item.subtitle}</span></div></div>
                })}
              </div>
            </div>

            <div className="hero-visual-enter relative hidden xl:block">
              <div className="hero-ring absolute left-1/2 top-1/2 h-[370px] w-[370px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-[rgba(26,86,255,0.2)]" />
              <div className="hero-ring-secondary absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-[rgba(10,172,255,0.18)]" />
              <div className="relative overflow-hidden rounded-[26px] shadow-[0_30px_80px_rgba(26,86,255,0.18),0_0_0_1px_rgba(26,86,255,0.1)]"><Image src={content.hero_image_url} alt={content.hero_image_alt} width={560} height={430} className="h-[430px] w-full object-cover transition-transform duration-700 hover:scale-[1.04]" priority /></div>
              {activeFloatingCards.slice(0, 3).map((item, index) => {
                const Icon = resolveIcon(item.icon)
                const positions = ['-top-5 right-[12%]', 'bottom-[8%] left-[-58px]', 'right-[-58px] top-[36%]']
                return <div key={item.title} className={`float-card absolute ${positions[index] ?? 'top-0 right-0'} flex items-center gap-3 rounded-[14px] border border-[rgba(26,86,255,0.14)] bg-[rgba(255,255,255,0.92)] px-4 py-3 shadow-[0_8px_30px_rgba(26,86,255,0.12)] backdrop-blur-xl`}><span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--blue-soft)] text-[var(--blue)]"><Icon className="h-4 w-4" /></span><div><strong className="block text-[0.78rem] font-bold text-[var(--text)]">{item.title}</strong><span className="text-[0.68rem] text-[var(--text-dim)]">{item.subtitle}</span></div></div>
              })}
            </div>
          </div>
        </section>

        <section id="why" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]"><div className="reveal text-center"><div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.why_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.why_title}</h2><p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">{content.why_description}</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{activeWhyItems.map((item) => { const Icon = resolveIcon(item.icon); return <article key={item.title} className="reveal group rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg)] p-8 shadow-[var(--shadow-card)] transition-[var(--transition)] hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]"><div className="mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-[var(--blue-soft)] text-[var(--blue)]"><Icon className="h-5 w-5" /></div><h3 className={`${headingFontClass} text-[1.05rem] font-bold text-[var(--text)]`}>{item.title}</h3><p className="mt-3 text-[0.88rem] leading-7 text-[var(--text-mid)]">{item.description}</p></article> })}</div></div>
        </section>

        <section id="programs" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div className="reveal"><div className="mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.programs_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.programs_title}</h2><p className="mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">{content.programs_description}</p></div><div className="reveal flex flex-wrap gap-2"><button type="button" onClick={() => setFilter('all')} className={`rounded-full border px-4 py-2 text-[0.82rem] font-bold ${filter === 'all' ? 'border-[var(--blue)] bg-[var(--blue)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-mid)]'}`}>Semua</button>{categories.map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-[0.82rem] font-bold ${filter === item ? 'border-[var(--blue)] bg-[var(--blue)] text-white' : 'border-[var(--border)] bg-white text-[var(--text-mid)]'}`}>{item}</button>)}</div></div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">{filteredPrograms.map((program) => <article key={program.title} className="reveal group overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-white transition-[var(--transition)] hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]"><div className="relative h-[155px] overflow-hidden"><Image src={program.image_url} alt={program.image_alt} width={300} height={155} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]" /><div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(30,45,80,0.45),transparent_60%)]" /><span className="absolute left-3 top-3 rounded-full bg-[var(--blue)] px-3 py-1 text-[0.7rem] font-extrabold text-white">{program.badge}</span></div><div className="p-5"><h3 className={`${headingFontClass} text-[0.98rem] font-bold text-[var(--text)]`}>{program.icon} {program.title}</h3><p className="mt-3 text-[0.84rem] leading-6 text-[var(--text-mid)]">{program.short_description}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="text-[0.75rem] text-[var(--text-dim)]">{program.level}</span><span className="text-[0.75rem] font-bold text-[var(--blue)]">{program.sessions_label}</span></div><div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4"><div><span className={`${headingFontClass} text-[0.95rem] font-extrabold text-[var(--text)]`}>{program.price_label}</span></div><HrefRenderer target={program.cta_url} className="rounded-lg bg-[var(--blue-soft)] px-4 py-2 text-[0.78rem] font-bold text-[var(--blue)] transition-[var(--transition)] hover:bg-[var(--blue)] hover:text-white">{program.cta_text}</HrefRenderer></div></div></article>)}</div>
          </div>
        </section>

        <section id="showcase" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1200px] items-center gap-16 xl:grid-cols-2"><div className="reveal-left grid grid-cols-2 gap-4">{activeShowcaseImages.slice(0, 4).map((image, index) => <div key={`${image.image_url}-${index}`} className={`overflow-hidden rounded-2xl border border-[var(--border)] transition-[var(--transition)] ${index === 1 ? 'mt-9 h-[190px]' : index === 2 ? '-mt-9 h-[190px]' : 'h-[190px]'}`}><Image src={image.image_url} alt={image.alt_text} width={300} height={190} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" /></div>)}</div><div className="reveal-right"><div className="mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.showcase_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.showcase_title}</h2><p className="mt-5 text-[0.93rem] leading-8 text-[var(--text-mid)]">{content.showcase_description}</p><div className="mt-7 grid gap-4">{content.showcase_features.map((item) => <div key={item} className="flex items-start gap-3"><span className="mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--blue-soft)] text-[var(--blue)]"><Check className="h-3.5 w-3.5" /></span><span className="text-[0.92rem] text-[var(--text-mid)]">{item}</span></div>)}</div><HrefRenderer target={content.showcase_cta_url} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--blue)] px-7 py-3 text-[0.95rem] font-bold text-white shadow-[0_6px_28px_rgba(26,86,255,0.35)] transition-[var(--transition)] hover:bg-[var(--blue-mid)]">{content.showcase_cta_text}<ArrowRight className="h-4 w-4" /></HrefRenderer></div></div>
        </section>
        <section id="pricing" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]"><div className="reveal text-center"><div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.pricing_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.pricing_title}</h2><p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">{content.pricing_description}</p></div><div className="mt-12 grid gap-6 lg:grid-cols-3">{activePlans.map((plan) => <article key={plan.name} className={`reveal relative rounded-[var(--radius)] border p-9 transition-[var(--transition)] ${plan.is_featured ? 'scale-[1.04] border-[var(--blue)] bg-[linear-gradient(145deg,#1A56FF_0%,#3B6EFF_100%)] shadow-[0_30px_70px_rgba(26,86,255,0.3)] max-md:scale-100' : 'border-[var(--border)] bg-white hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]'}`}>{plan.badge_text ? <div className={`absolute left-1/2 top-[-16px] -translate-x-1/2 rounded-full px-4 py-1 text-[0.73rem] font-extrabold shadow-[0_4px_14px_rgba(26,86,255,0.2)] ${plan.is_featured ? 'bg-white text-[var(--blue)]' : 'bg-[var(--blue)] text-white'}`}>{plan.badge_text}</div> : null}<div className={`text-[0.8rem] font-bold uppercase tracking-[0.1em] ${plan.is_featured ? 'text-white/80' : 'text-[var(--text-dim)]'}`}>{plan.name}</div><div className={`${headingFontClass} mt-4 text-[2.3rem] font-extrabold ${plan.is_featured ? 'text-white' : 'text-[var(--text)]'}`}>{plan.price}</div><div className={`mt-2 text-[0.82rem] ${plan.is_featured ? 'text-white/80' : 'text-[var(--text-dim)]'}`}>{plan.billing_period}</div><p className={`mt-4 text-[0.84rem] leading-6 ${plan.is_featured ? 'text-white/90' : 'text-[var(--text-mid)]'}`}>{plan.description}</p><div className="mt-8 grid gap-3">{plan.features.map((feature) => <div key={feature} className={`flex items-center gap-3 text-[0.88rem] ${plan.is_featured ? 'text-white' : 'text-[var(--text-mid)]'}`}><Check className={`h-4 w-4 ${plan.is_featured ? 'text-white' : 'text-[var(--blue)]'}`} />{feature}</div>)}</div><HrefRenderer target={plan.cta_url} className={`mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-[0.92rem] font-bold ${plan.is_featured ? 'bg-white text-[var(--blue)]' : 'border border-[var(--border)] bg-[var(--bg)] text-[var(--text)]'}`}>{plan.cta_text}</HrefRenderer></article>)}</div><p className="reveal mt-8 text-center text-[0.78rem] text-[var(--text-dim)]">{content.pricing_note}</p></div>
        </section>

        <section id="flow" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]"><div className="reveal text-center"><div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.flow_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.flow_title}</h2><p className="mx-auto mt-4 max-w-[580px] text-base leading-7 text-[var(--text-dim)]">{content.flow_description}</p></div><div className="relative mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-5">{activeFlowSteps.map((step) => { const Icon = resolveIcon(step.icon); return <article key={step.title} className="reveal relative z-10 flex flex-col items-center text-center"><div className="flex h-[62px] w-[62px] items-center justify-center rounded-full border-2 border-[var(--border)] bg-[var(--bg)] text-[var(--blue)]"><Icon className="h-6 w-6" /></div><h3 className={`${headingFontClass} mt-5 text-[0.9rem] font-bold text-[var(--text)]`}>{step.title}</h3><p className="mt-2 text-[0.78rem] leading-6 text-[var(--text-dim)]">{step.description}</p></article> })}</div></div>
        </section>

        <section id="testimonials" className="bg-[var(--bg)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]"><div className="reveal text-center"><div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.testimonials_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.testimonials_title}</h2><p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">{content.testimonials_description}</p></div><div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{activeTestimonials.map((item) => <article key={item.name} className="reveal rounded-[var(--radius)] border border-[var(--border)] bg-white p-7 transition-[var(--transition)] hover:border-[var(--blue)] hover:shadow-[var(--shadow-blue)]"><div className="mb-4 flex text-[#fbbf24]">{Array.from({ length: item.rating }).map((_, index) => <Star key={`${item.name}-${index}`} className="h-4 w-4 fill-current" />)}</div><p className="min-h-28 text-[0.92rem] italic leading-7 text-[var(--text-mid)]">&quot;{item.content}&quot;</p><div className="mt-6 flex items-center gap-3">{item.photo_url ? <div className="relative h-[42px] w-[42px] overflow-hidden rounded-full"><Image src={item.photo_url} alt={item.photo_alt || item.name} fill className="object-cover" /></div> : <div className={`${headingFontClass} flex h-[42px] w-[42px] items-center justify-center rounded-full text-base font-extrabold text-white`} style={{ backgroundImage: `linear-gradient(135deg, ${item.gradient_from}, ${item.gradient_to})` }}>{item.name.charAt(0).toUpperCase()}</div>}<div><strong className="block text-[0.88rem] font-bold text-[var(--text)]">{item.name}</strong><span className="text-[0.75rem] text-[var(--text-dim)]">{item.role}</span></div></div></article>)}</div></div>
        </section>

        <section id="faq" className="bg-[var(--surface)] px-4 py-[100px] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[740px]"><div className="reveal text-center"><div className="mx-auto mb-3 inline-flex rounded-full bg-[var(--blue-soft)] px-4 py-1 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[var(--blue)]">{content.faq_badge}</div><h2 className={`${headingFontClass} text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold text-[var(--text)]`}>{content.faq_title}</h2><p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-[var(--text-dim)]">{content.faq_description}</p></div><div className="mt-12 grid gap-4">{activeFaqItems.map(({ question, answer }, index) => { const isOpen = openFaq === index; return <article key={`${question}-${index}`} className={`reveal overflow-hidden rounded-[var(--radius-sm)] border transition-colors ${isOpen ? 'faq-item-open border-[var(--blue)] bg-white' : 'border-[var(--border)] bg-[var(--bg)]'}`}><button type="button" onClick={() => setOpenFaq(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.93rem] font-semibold text-[var(--text)]"><span>{question}</span><span className={`faq-icon flex h-6 w-6 items-center justify-center rounded-full ${isOpen ? 'bg-[var(--blue)] text-white' : 'bg-[var(--blue-soft)] text-[var(--blue)]'}`}>+</span></button><div className="faq-answer"><p className="text-[0.88rem] leading-7 text-[var(--text-mid)]">{answer}</p></div></article> })}</div></div>
        </section>

        <section id="cta" className="bg-[var(--bg)] px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[880px]"><div className="reveal relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--blue)_0%,#0A8FE8_50%,var(--blue-mid)_100%)] px-6 py-16 text-center shadow-[0_40px_100px_rgba(26,86,255,0.3)] sm:px-12"><div className="relative z-10"><h2 className={`${headingFontClass} text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-tight text-white`}>{content.cta_title}</h2><p className="mx-auto mt-5 max-w-[520px] text-base leading-7 text-white/80">{content.cta_description}</p><div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"><HrefRenderer target={content.cta_primary_url} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-[0.95rem] font-extrabold text-[var(--blue)]">{content.cta_primary_text}<ArrowRight className="h-4 w-4" /></HrefRenderer><HrefRenderer target={content.cta_secondary_url} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border-2 border-white/50 px-8 py-3 text-[0.95rem] font-bold text-white"><MessageCircle className="h-4 w-4" />{content.cta_secondary_text}</HrefRenderer></div></div></div></div>
        </section>
      </main>

      <footer className="bg-[var(--text)] px-4 pb-8 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1200px]"><div className="mb-12 grid gap-12 md:grid-cols-2 xl:grid-cols-[1.5fr,1fr,1fr,1.2fr]"><div><div className="mb-4 flex items-center gap-3 text-white"><LogoMark content={content} headingFontClass={headingFontClass} /></div><p className="max-w-sm text-[0.85rem] leading-7 text-white/45">{content.footer_description}</p><div className="mt-5 flex gap-2">{activeSocialLinks.map((link) => { const Icon = resolveIcon(link.icon); return <HrefRenderer key={link.platform} target={link.url} className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-white/12 bg-white/8 text-white transition-[var(--transition)] hover:bg-[var(--blue)]"><Icon className="h-4 w-4" /></HrefRenderer> })}</div></div><div><h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>Navigasi</h3><div className="grid gap-3 text-[0.85rem] text-white/45">{quickLinks.map((link) => <HrefRenderer key={link.label} target={link.url} className="transition-colors hover:text-white">{link.label}</HrefRenderer>)}</div></div><div><h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>{content.footer_program_title}</h3><div className="grid gap-3 text-[0.85rem] text-white/45">{footerProgramLinks.map((link) => <HrefRenderer key={link.label} target={link.url} className="transition-colors hover:text-white">{link.label}</HrefRenderer>)}</div></div><div><h3 className={`${headingFontClass} mb-5 text-[0.85rem] font-bold text-white`}>Hubungi Kami</h3><div className="grid gap-4 text-[0.85rem] text-white/45"><div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>{content.contact_phone}</span></div><div className="flex items-start gap-3"><Monitor className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>{content.contact_email}</span></div><div className="flex items-start gap-3"><Code2 className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>{content.contact_address}</span></div><div className="flex items-start gap-3"><GraduationCap className="mt-0.5 h-4 w-4 text-[var(--cyan)]" /><span>{content.contact_hours}</span></div></div></div></div><div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-[0.8rem] text-white/30 md:flex-row md:items-center md:justify-between"><span>{content.footer_copyright}</span><div className="flex gap-6"><HrefRenderer target={content.footer_policy_url} className="transition-colors hover:text-white">{content.footer_policy_text}</HrefRenderer><HrefRenderer target={content.footer_terms_url} className="transition-colors hover:text-white">{content.footer_terms_text}</HrefRenderer></div></div></div>
      </footer>
    </div>
  )
}
