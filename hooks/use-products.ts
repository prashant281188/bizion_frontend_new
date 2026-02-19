import { getProducts } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
    return useQuery({
        queryKey: ["product"],
        queryFn: getProducts,
        staleTime: 1000 * 60 * 10, // cache 10 min
    });
}