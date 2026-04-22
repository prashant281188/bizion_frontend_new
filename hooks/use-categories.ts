import { fetchCategories } from "@/lib/api/public";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function usePublicCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    staleTime: STALE.medium,
  });
}
