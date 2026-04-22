import { useQuery } from "@tanstack/react-query";
import { adminGetVariantDetail, type VariantDetail } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";

export function useVariantDetail(variantId: string | null) {
  return useQuery<VariantDetail>({
    queryKey: queryKeys.variantDetail(variantId),
    queryFn: () => adminGetVariantDetail(variantId!),
    enabled: !!variantId,
    staleTime: STALE.default,
  });
}
