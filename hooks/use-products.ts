import { getProductsWithFilter } from "@/lib/api/public";
import { adminListProducts, type ListProductParams } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function useProducts({
  page,
  limit,
  search,
  brandId,
  categoryId,
  sort,
}: {
  page: number;
  limit: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: queryKeys.products({ page, limit, search, brandId, categoryId, sort }),
    queryFn: () => getProductsWithFilter({ page, limit, search, brandId, categoryId, sort }),
    staleTime: STALE.medium,
    placeholderData: (prev) => prev,
  });
}

export function useFeaturedProducts(limit = 10) {
  return useQuery({
    queryKey: queryKeys.featuredProducts(limit),
    queryFn: () => getProductsWithFilter({ page: 1, limit, isFeatured: true }),
    staleTime: STALE.medium,
  });
}

export function useNewProducts(limit = 10) {
  return useQuery({
    queryKey: queryKeys.newProducts(limit),
    queryFn: () => getProductsWithFilter({ page: 1, limit, isNew: true }),
    staleTime: STALE.medium,
  });
}

export function useAdminProducts(params: ListProductParams) {
  return useQuery({
    queryKey: queryKeys.adminProducts(params),
    queryFn: () => adminListProducts(params),
    staleTime: STALE.default,
    placeholderData: (prev) => prev,
  });
}
