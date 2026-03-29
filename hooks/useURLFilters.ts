import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function useURLFilters() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  type Filter = {
    search: string,
    categoryId: string,
    brandId: string,
    page: number,
    limit: number,
    sort: string,
  }

  const filters : Filter = {
    search: params.get("search") ?? "",
    categoryId: params.get("categoryId") ?? "",
    brandId: params.get("brandId") ?? "",
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? 12),
    sort: params.get("sort") ?? "",
  };

  const setFilter = (keyOrUpdates: keyof Filter | Partial<Filter>, value?: string | number | null) => {
    const updates: Partial<Filter> = typeof keyOrUpdates === "string"
      ? { [keyOrUpdates]: value }
      : keyOrUpdates;

    const newParams = new URLSearchParams(params.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val === "" || val === 0 || val === null || val === undefined) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(val));
      }
    });

    if (!("page" in updates)) {
      newParams.set("page", "1");
    }

    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  return { filters, setFilter };
}
