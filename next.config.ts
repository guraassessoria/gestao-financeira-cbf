import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // child_process é usado pelo python-runner para chamar parsers.py
  serverExternalPackages: ['child_process'],
  // Cabecalhos de seguranca
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ]
  },
}

export default nextConfig
