import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Kursus Komputer | Belajar Teknologi Masa Depan',
    template: '%s | Kursus Komputer',
  },
  description:
    'Platform kursus komputer terpercaya untuk siswa SMP, SMA, dan umum. Belajar Microsoft Office, Desain Grafis, AI, dan Pembuatan Website.',
  keywords: ['kursus komputer', 'les komputer', 'microsoft office', 'desain grafis', 'belajar AI'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
