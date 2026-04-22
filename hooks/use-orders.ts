import { useQuery } from "@tanstack/react-query";
import { adminGetOrders } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";

export function useOrders() {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: adminGetOrders,
    staleTime: STALE.default,
  });
}
