/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://dclaw-forecast-backend:8134/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
