/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remover configuraciones obsoletas
  images: {
    domains: ["localhost"],
    unoptimized: true,
  },
  // Configuración para desarrollo
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
