// Pure types + helpers for linking a brochure to somewhere on the main
// website — either a /products category tab or a /collections "story"
// page. No fetching here (that's websiteCategories.ts, server-only) so
// this file is safe to import from client components too.

export type WebsiteLinkType = "category" | "story";

export type WebsiteLink = {
  type: WebsiteLinkType;
  value: string; // category name, or collection slug
  label: string; // display text — same as value for a category, the
  // collection's title for a story (since "aranya" isn't presentable)
};

export type WebsiteLinkOptions = {
  categories: string[];
  stories: { slug: string; title: string }[];
};

// Encoded as "type|value|label" — used as the tag inside the brochure's
// category blob pathname (see buildWebsiteLinkPathname in brochures.ts).
export function encodeWebsiteLink(link: WebsiteLink): string {
  return encodeURIComponent(`${link.type}|${link.value}|${link.label}`);
}

export function decodeWebsiteLink(raw: string): WebsiteLink | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const [type, value, ...labelParts] = decoded.split("|");
  const label = labelParts.join("|");
  if ((type === "category" || type === "story") && value && label) {
    return { type, value, label };
  }
  return null;
}

// The <select>'s own option values — "type|value", label resolved
// separately since a bare select option can't carry it directly.
export function selectValueFor(link: WebsiteLink | null): string {
  return link ? `${link.type}|${link.value}` : "";
}

export function parseWebsiteLinkSelection(raw: string, options: WebsiteLinkOptions): WebsiteLink | null {
  if (!raw) return null;
  const [type, value] = raw.split("|");
  if (type === "category" && options.categories.includes(value)) {
    return { type: "category", value, label: value };
  }
  if (type === "story") {
    const story = options.stories.find((s) => s.slug === value);
    if (story) return { type: "story", value: story.slug, label: story.title };
  }
  return null;
}

export function buildWebsiteLinkHref(websiteBase: string, link: WebsiteLink): string {
  if (link.type === "category") {
    return `${websiteBase}/products?category=${encodeURIComponent(link.value)}`;
  }
  return `${websiteBase}/collections/${link.value}`;
}
