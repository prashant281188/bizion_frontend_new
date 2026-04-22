import { useQuery } from "@tanstack/react-query";
import { adminGetSkus, type Skus } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";

export function useSkus(search: string) {
  return useQuery<Skus[]>({
    queryKey: queryKeys.adminSkus(search),
    queryFn: () => adminGetSkus({ search }),
    enabled: search.trim().length > 0,
    staleTime: STALE.default,
  });
}
