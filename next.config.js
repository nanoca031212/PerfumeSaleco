/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Otimizações para Vercel
  experimental: {
    optimizeCss: true,
    scrollRestoration: true
  },
  
  // Configurações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // Redirects para SEO
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/collections/all',
        permanent: true
      }
    ]
  },
  
  // Rewrites para URLs limpas
  async rewrites() {
    return [
      {
        source: '/collections/:category',
        destination: '/api/collections/:category'
      },
      {
        source: '/tracking/v1/events',
        destination: '/api/tracking/v1/events'
      }
    ]
  },
  
  // Compressão
  compress: true
}

module.exports = nextConfig
