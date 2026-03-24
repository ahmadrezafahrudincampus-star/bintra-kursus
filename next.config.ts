import type { NextConfig } from 'next'
import type { RemotePattern } from 'next/dist/shared/lib/image-config'

const remotePatterns: RemotePattern[] = [
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    port: '',
    pathname: '/**',
  },
]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (supabaseUrl) {
  const hostname = new URL(supabaseUrl).hostname

  remotePatterns.push({
    protocol: 'https',
    hostname,
    port: '',
    pathname: '/storage/v1/object/public/**',
  })
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
}

export default nextConfig
