import { getCarouselData } from "@/lib/api/public";
import { queryKeys, STALE } from "@/lib/query-config";
import { useQuery } from "@tanstack/react-query";

export function useCarouselData() {
  return useQuery({
    queryKey: queryKeys.carousel,
    queryFn: getCarouselData,
    staleTime: STALE.medium,
  });
}
