import { getBrands } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useBrands() {
    return useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
        staleTime: 1000 * 60 * 10, // cache 10 min
    });
}