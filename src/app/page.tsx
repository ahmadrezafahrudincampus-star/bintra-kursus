import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import { LandingPageClient } from '@/components/public/landing-page-client'
import { getLandingContent } from '@/lib/actions/landing-content'

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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getLandingContent()

  return {
    title: content.seo_meta_title || content.site_name,
    description: content.seo_meta_description,
    keywords: content.seo_meta_keywords
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    openGraph: {
      title: content.seo_og_title || content.seo_meta_title || content.site_name,
      description: content.seo_og_description || content.seo_meta_description,
      images: content.seo_og_image_url ? [{ url: content.seo_og_image_url }] : undefined,
    },
    icons: content.seo_favicon_url
      ? {
          icon: [{ url: content.seo_favicon_url }],
        }
      : undefined,
  }
}

export default async function HomePage() {
  const landingContent = await getLandingContent()

  return (
    <LandingPageClient
      bodyFontClass={dmSans.className}
      headingFontClass={syne.className}
      content={landingContent}
    />
  )
}
