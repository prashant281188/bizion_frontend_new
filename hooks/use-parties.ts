import { useQuery } from "@tanstack/react-query";
import { adminGetParties, type Party } from "@/lib/api/admin";

export function useParties(search: string) {
  return useQuery<Party[]>({
    queryKey: ["admin-parties", search],
    queryFn: () => adminGetParties({ search }),
    enabled: search.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
