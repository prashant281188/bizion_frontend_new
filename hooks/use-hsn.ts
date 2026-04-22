import { useQuery } from "@tanstack/react-query";
import { adminGetHsn, adminGetGstGroups, type ListHsnParams } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";

export function useHsn(params?: ListHsnParams) {
  return useQuery({
    queryKey: queryKeys.adminHsn(params),
    queryFn: () => adminGetHsn(params),
    staleTime: STALE.default,
    placeholderData: (prev) => prev,
  });
}

export function useGstGroups(search?: string) {
  return useQuery({
    queryKey: queryKeys.adminGstGroups(search),
    queryFn: () => adminGetGstGroups(search ? { search } : undefined),
    staleTime: STALE.default,
  });
}
