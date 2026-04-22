import { useQuery } from "@tanstack/react-query";
import { adminGetParties, type Party } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";

export function useParties(search: string) {
  return useQuery<Party[]>({
    queryKey: queryKeys.adminParties(search),
    queryFn: () => adminGetParties({ search }),
    enabled: search.trim().length > 0,
    staleTime: STALE.default,
  });
}
