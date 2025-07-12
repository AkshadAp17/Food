/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['drizzle-orm', '@neondatabase/serverless'],
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*'
      }
    ]
  }
}

export default nextConfig