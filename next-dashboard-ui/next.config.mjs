/** @type {import('next').NextConfig} */
const nextConfig = {
     images: {
    remotePatterns: [
      { hostname: "images.pexels.com" },
      { hostname: "ik.imagekit.io" }
    ],
    domains: [
      "source.unsplash.com",
      "ik.imagekit.io",
      // thêm các domain khác nếu cần
    ],
  },
};

export default nextConfig;
