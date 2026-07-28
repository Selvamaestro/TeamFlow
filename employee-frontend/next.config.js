/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We lint separately; don't let warnings block `next build`.
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: ['192.168.1.5:5000'],
  images: {
    // Cloudinary-hosted avatars/documents (config/cloudinary.js on the backend)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

module.exports = nextConfig;
