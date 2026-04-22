import { getProduct } from "@/lib/api/public";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.productDetail(id),
    queryFn: () => getProduct(id),
    staleTime: STALE.long,
  });
}
