import { getProductsWithFilter } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useProducts({ page, limit, search, brandId, categoryId, sort }: { page: number, limit: number, search?: string, brandId?: string, categoryId?: string, sort?: string }) {
    return useQuery({
        queryKey: ["product", page, limit, search, brandId, categoryId, sort],
        queryFn: () => getProductsWithFilter({ page, limit, search, brandId, categoryId, sort }),
        staleTime: 1000 * 60 * 10,
        placeholderData: (previousData) => previousData,
    });
}
