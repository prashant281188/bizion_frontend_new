import { getProductsWithFilter } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useProducts({ page, limit, search, brand, category,sort }: { page: number, limit: number, search?: string, brand?: string, category?: string , sort?:string}) {
    return useQuery({
        queryKey: ["product", page, limit, search,brand , category,sort],
        queryFn: () => getProductsWithFilter({ page, limit, search, brand, category, sort }),
        staleTime: 1000 * 60 * 10, // cache 10 min
        placeholderData: (previousData) => previousData,
    });
}