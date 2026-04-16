import { useQuery } from "@tanstack/react-query";
import { adminGetHsn, adminGetGstGroups, type ListHsnParams } from "@/lib/api/admin";

export function useHsn(params?: ListHsnParams) {
    return useQuery({
        queryKey: ["admin-hsn", params],
        queryFn: () => adminGetHsn(params),
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });
}

export function useGstGroups(search?: string) {
    return useQuery({
        queryKey: ["admin-gst-groups", search],
        queryFn: () => adminGetGstGroups(search ? { search } : undefined),
        staleTime: 1000 * 60 * 5,
    });
}
