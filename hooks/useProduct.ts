import { getProduct } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useProduct(id: string) {
    return useQuery({
        queryKey: ["product", id],
        queryFn: () => getProduct(id),
        
       
    });
}