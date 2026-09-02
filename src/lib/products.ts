import productsData from "@/data/products.json";

// Primary front-page category structure, per the studio's direction: browse
// by product type (Wall Sconces, Floor Lamps, ...) rather than by story/
// series. "Collectables" is kept as a distinct 11th bucket for pieces that
// don't fit a functional type — it's an established category in the
// studio's own brand architecture doc, not a type we're inventing.
export const productCategories = [
  "Wall Sconces",
  "Wall Art",
  "Wall Clock",
  "Pendant Lights",
  "Ceiling Lights",
  "Table Lights",
  "Floor Lamps",
  "Accent Furniture Pieces",
  "Artisanal Pieces",
  "Mirror",
  "Collectables",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  image: string;
  pdf: string;
  placeholder?: boolean;
};

const products = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getOtherProducts(slug: string, limit = 12): Product[] {
  const others = products.filter((p) => p.slug !== slug);
  return others.slice(0, limit);
}

// Always returns every category in the canonical order above (even ones
// with no products yet), so the front page's headings stay stable as real
// products are added.
export function getProductsByCategory(): Map<ProductCategory, Product[]> {
  const map = new Map<ProductCategory, Product[]>();
  for (const category of productCategories) map.set(category, []);
  for (const product of products) {
    const list = map.get(product.category) ?? [];
    list.push(product);
    map.set(product.category, list);
  }
  return map;
}
