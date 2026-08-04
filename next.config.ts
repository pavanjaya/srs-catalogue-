import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder product images are SVGs. Once real JPG/PNG catalogue
    // photos replace them (see README.md), this can be removed.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;
