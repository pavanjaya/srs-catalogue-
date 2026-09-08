import type { MetadataRoute } from "next";

// Brochure links are meant to be shared privately with a specific client,
// not discovered via search — keep the whole app out of crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
