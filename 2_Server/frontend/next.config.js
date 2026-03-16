/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/ui',
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_URL: '',
    NEXT_PUBLIC_ADMIN_SECRET: process.env.NEXT_PUBLIC_ADMIN_SECRET || '',
  }
};
module.exports = nextConfig;
