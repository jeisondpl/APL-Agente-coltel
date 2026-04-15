import type { NextConfig } from 'next'

// Parse optional media base URL from environment for dynamic image domains
function getMediaHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_MEDIA_BASE_URL
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

const mediaHostname = getMediaHostname()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local development (MinIO / localhost)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      // Production media server via env var
      ...(mediaHostname && mediaHostname !== 'localhost'
        ? [
            {
              protocol: 'https' as const,
              hostname: mediaHostname,
              pathname: '/**',
            },
          ]
        : []),
      // Common CDN / stock image hosts
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

export default nextConfig
