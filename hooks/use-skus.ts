import { useQuery } from "@tanstack/react-query";
import { adminGetSkus, type Skus } from "@/lib/api/admin";

export function useSkus(search: string) {
  return useQuery<Skus[]>({
    queryKey: ["admin-skus", search],
    queryFn: () => adminGetSkus({ search }),
    enabled: search.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
