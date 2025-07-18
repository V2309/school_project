/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
    domains: [
      "source.unsplash.com",
      // thêm các domain khác nếu cần
    ],
  },
};

export default nextConfig;
