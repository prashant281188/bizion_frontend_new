import { getCarouselData } from "@/lib/api/public";
import { useQuery } from "@tanstack/react-query";

export function useCarouselData() {
    return useQuery({
        queryKey: ["carousel"],
        queryFn: getCarouselData,
        staleTime: 5 * 1000 * 60

    })
}
