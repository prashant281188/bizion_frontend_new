export const STALE = {
  default: 5 * 60 * 1000,   // 5 min
  medium: 10 * 60 * 1000,   // 10 min
  long: 30 * 60 * 1000,     // 30 min
} as const;

export const queryKeys = {
  // ── Public ──────────────────────────────────────────────────────
  brands: ["brands"] as const,
  carousel: ["carousel"] as const,
  categories: ["categories"] as const,
  catalog: (brandId?: string, categoryId?: string) =>
    ["catalog", brandId, categoryId] as const,

  // "product" root split into two distinct trees to prevent cache collisions
  productDetail: (id: string) => ["product-detail", id] as const,
  products: (params: object) => ["products", params] as const,
  featuredProducts: (limit: number) => ["products", "featured", limit] as const,
  newProducts: (limit: number) => ["products", "new", limit] as const,

  // ── Admin ────────────────────────────────────────────────────────
  adminProducts: (params: object) => ["admin-products", params] as const,
  adminHsn: (params?: object) => ["admin-hsn", params] as const,
  adminGstGroups: (search?: string) => ["admin-gst-groups", search] as const,
  adminOptions: ["product-options"] as const,
  orders: ["orders"] as const,
  adminParties: (search: string) => ["admin-parties", search] as const,
  adminSkus: (search: string) => ["admin-skus", search] as const,
  variantDetail: (id: string | null) => ["variant-detail", id] as const,
};
