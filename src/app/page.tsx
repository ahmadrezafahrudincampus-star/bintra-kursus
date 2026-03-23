import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import { LandingPageClient } from '@/components/public/landing-page-client'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Beranda',
  description:
    'Platform kursus komputer terpercaya untuk siswa SMP, SMA, dan umum. Belajar Microsoft Office, Desain Grafis, AI, dan Pembuatan Website dari Rp 15.000/pertemuan.',
}

export default function HomePage() {
  return (
    <LandingPageClient
      bodyFontClass={dmSans.className}
      headingFontClass={syne.className}
    />
  )
}
