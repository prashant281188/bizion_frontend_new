import { fetchCategories } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function usePublicCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // cache 10 min
  });
}