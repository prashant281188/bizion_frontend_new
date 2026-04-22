import { adminGetOptions, adminCreateOption } from "@/lib/api/admin";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOptions() {
  return useQuery({
    queryKey: queryKeys.adminOptions,
    queryFn: adminGetOptions,
    staleTime: STALE.medium,
  });
}

export function useCreateOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionName: string) => adminCreateOption(optionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminOptions });
    },
  });
}
