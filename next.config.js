/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'source.unsplash.com',
      'images.unsplash.com', 
      'plus.unsplash.com',
      'booking-com15.p.rapidapi.com',
      'tripadvisor16.p.rapidapi.com',
      'dynamic-media-cdn.tripadvisor.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

module.exports = nextConfig