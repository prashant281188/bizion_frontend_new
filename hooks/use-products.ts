import {  getProductsWithFilter } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useProducts({ page, limit, search }: { page: number, limit: number, search?: string }) {
    return useQuery({
        queryKey: ["product", page, limit, search],
        queryFn: () => getProductsWithFilter({ page, limit, search }),
        staleTime: 1000 * 60 * 10, // cache 10 min
        placeholderData: (previousData) => previousData,
    });
}