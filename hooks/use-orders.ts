import { useQuery } from "@tanstack/react-query";
import { adminGetOrders } from "@/lib/api/admin";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => adminGetOrders(),
  });
}
