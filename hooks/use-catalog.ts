import { getCatalog } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useCatalog({
  brandId,
  categoryId,
}: {
  brandId?: string;
  categoryId?: string;
} = {}) {
  return useQuery({
    queryKey: ["catalog", brandId, categoryId],
    queryFn: () => getCatalog({ brandId, categoryId }),
    staleTime: 1000 * 60 * 10,
  });
}
