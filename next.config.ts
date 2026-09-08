import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Real brochure PDFs (cover + product pages + back page, real
      // photography) run several MB — well past Next's 1MB Server Action
      // default. uploadCategoryBrochure sends the file straight through
      // one, so this needs real headroom.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
