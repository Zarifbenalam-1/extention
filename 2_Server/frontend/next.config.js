/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',         // Static HTML export — served by FastAPI
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_ADMIN_SECRET: process.env.NEXT_PUBLIC_ADMIN_SECRET || '',
  }
};
module.exports = nextConfig;
