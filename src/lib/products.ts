import productsData from "@/data/products.json";

export type Product = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  image: string;
  pdf: string;
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

export function getProductsByCategory(): Map<string, Product[]> {
  const map = new Map<string, Product[]>();
  for (const product of products) {
    const list = map.get(product.category) ?? [];
    list.push(product);
    map.set(product.category, list);
  }
  return map;
}
