import { getProductsWithFilter } from "@/lib/api/public";
import { adminListProducts, type ListProductParams } from "@/lib/api/admin";
import { useQuery } from "@tanstack/react-query";

export function useProducts({ page, limit, search, brandId, categoryId, sort }: { page: number, limit: number, search?: string, brandId?: string, categoryId?: string, sort?: string }) {
    return useQuery({
        queryKey: ["product", page, limit, search, brandId, categoryId, sort],
        queryFn: () => getProductsWithFilter({ page, limit, search, brandId, categoryId, sort }),
        staleTime: 1000 * 60 * 10,
        placeholderData: (previousData) => previousData,
    });
}

export function useFeaturedProducts(limit = 10) {
    return useQuery({
        queryKey: ["product", "featured", limit],
        queryFn: () => getProductsWithFilter({ page: 1, limit, isFeatured: true }),
        staleTime: 1000 * 60 * 10,
    });
}

export function useNewProducts(limit = 10) {
    return useQuery({
        queryKey: ["product", "new", limit],
        queryFn: () => getProductsWithFilter({ page: 1, limit, isNew: true }),
        staleTime: 1000 * 60 * 10,
    });
}

export function useAdminProducts(params: ListProductParams) {
    return useQuery({
        queryKey: ["admin-products", params],
        queryFn: () => adminListProducts(params),
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
    });
}
