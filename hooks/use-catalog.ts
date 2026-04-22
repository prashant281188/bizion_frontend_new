import { getCatalog } from "@/lib/api/public";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function useCatalog({ brandId, categoryId }: { brandId?: string; categoryId?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.catalog(brandId, categoryId),
    queryFn: () => getCatalog({ brandId, categoryId }),
    staleTime: STALE.medium,
  });
}
