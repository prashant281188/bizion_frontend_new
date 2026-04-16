import { useQuery } from "@tanstack/react-query";
import { adminGetVariantDetail, type VariantDetail } from "@/lib/api/admin";

export function useVariantDetail(variantId: string | null) {
  return useQuery<VariantDetail>({
    queryKey: ["variant-detail", variantId],
    queryFn: () => adminGetVariantDetail(variantId!),
    enabled: !!variantId,
    staleTime: 5 * 60 * 1000,
  });
}
