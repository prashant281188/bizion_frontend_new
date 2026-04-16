import { adminGetOptions, adminCreateOption } from "@/lib/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useOptions() {
  return useQuery({
    queryKey: ["product-options"],
    queryFn: adminGetOptions,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCreateOption() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionName: string) => adminCreateOption(optionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-options"] });
    },
  });
}
