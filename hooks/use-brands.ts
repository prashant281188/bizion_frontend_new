import { getBrands } from "@/lib/api/public";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: getBrands,
    staleTime: STALE.medium,
  });
}
